// src/app/services/chat-core.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, BehaviorSubject, throwError } from 'rxjs';
import { takeUntil, filter, map, catchError } from 'rxjs/operators';
import { WebSocketService } from './user-websocket.service';
import { ChatHistoryService } from './chat-history.service';
import { SessionService } from './session.service';
// Import MessageModel
import { MessageModel } from '../models/message.model';
// Import UserHistoryResponseModel karena API history mengembalikan ini
import { ChatHistoryResponseModel, UserHistoryResponseModel } from '../models/chat_history_response.model'; // Pastikan import ini benar
import { ServerRole, ENUM_SENDER } from '../constants/enum.constant';

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService implements OnDestroy {

  private _userId: string | null = null;
  private destroy$ = new Subject<void>();

  private _incomingMessages = new Subject<MessageModel>();
  public readonly incomingMessages$ = this._incomingMessages.asObservable();

  private _isLoadingSending = new BehaviorSubject<boolean>(false);
  public readonly isLoadingSending$ = this._isLoadingSending.asObservable();

  public readonly wsConnectionStatus$: Observable<string>;

  constructor(
    private wsService: WebSocketService,
    private historyService: ChatHistoryService,
    private sessionService: SessionService
  ) {
    console.log('ChatCoreService initialized.');

    this.wsConnectionStatus$ = this.wsService.getStatus();

    this.sessionService.initializationStatus$
      .pipe(
        filter(isInitialized => isInitialized === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this._userId = this.sessionService.getUserId();
        if (this._userId) {
          console.log('ChatCoreService: Session ready, user ID:', this._userId, '. Connecting WebSocket.');
          this.wsService.connect(this._userId, ServerRole.User)
            .then(() => {
              console.log('ChatCoreService: WebSocket connected. Subscribing to messages.');
              this.wsService.getMessages()
                .pipe(takeUntil(this.destroy$)) // Cleanup langganan internal WS saat service dihancurkan
                .subscribe(
                  data => this.handleRawWebSocketMessage(data),
                  error => console.error('ChatCoreService: WebSocket message stream error:', error), // Tangani error stream
                  () => console.log('ChatCoreService: WebSocket message stream completed.') // Tangani completion stream
                );
            })
            .catch(error => {
              console.error('ChatCoreService: WebSocket connection failed:', error);
              // Pertimbangkan untuk mengupdate status koneksi melalui BehaviorSubject jika ada
            });
        } else {
          console.error('ChatCoreService: Session ready, but User ID is null.');
          // Beri tahu komponen UI jika user ID tidak tersedia
        }
      });
  }

  sendMessage(text: string): void {
    if (!this._userId) {
      console.error('ChatCoreService: Cannot send message, User ID is not set.');
      // Feedback ke user di UI
      return;
    }
    const trimmedText = text.trim();
    if (!trimmedText) {
      console.warn('ChatCoreService: Cannot send empty message.');
      // Feedback ke user di UI
      return;
    }

    const payload = {
      type: 'message',
      user_id: this._userId,
      role: ServerRole.User, // Role pengirim di payload
      message: trimmedText, // Isi pesan user
    };

    console.log('ChatCoreService: Sending message:', payload);
    this.wsService.sendMessage(payload);

    // Aktifkan loading indicator kirim
    this._isLoadingSending.next(true);

    // Catatan: Optimistic UI update (menambahkan pesan user langsung di UI)
    // sebaiknya dilakukan di komponen UI setelah memanggil sendMessage.
    // Service ini hanya bertanggung jawab mengirim dan menerima balasan.
  }

  private handleRawWebSocketMessage(data: any): void {
    console.log('ChatCoreService: Processing raw message:', data);

    let processedMessage: MessageModel | null = null;
    let stopLoading = false; // Flag untuk menentukan apakah loading kirim harus berhenti

    // --- Logika memproses format pesan yang berbeda dari server ---

    // Format: {success: true, data: '...', from: '...', room_id: '...'} (Balasan Bot/Admin)
    // Ini adalah balasan utama terhadap pesan user
    if (data.success === true && typeof data.data === 'string' && data.from !== undefined) {
      const content = data.data.trim();
      if (content) {
        const formattedTime = new Date().toISOString();
        let senderType: ENUM_SENDER = ENUM_SENDER.Chatbot; // Default Chatbot/Support

        // Mapping role server ke sender UI. Asumsi Admin dan Chatbot tampil sama di UI.
        if (data.from === ServerRole.Admin || data.from === ServerRole.Chatbot) {
          senderType = ENUM_SENDER.Chatbot;
        }
        // Jika from === ServerRole.User, ini mungkin konfirmasi pesan sendiri,
        // yang biasanya tidak perlu ditampilkan lagi jika sudah ada optimistic update.
        // if (data.from === ServerRole.User) { /* Do nothing, handled by optimistic update */ }

        if (data.from !== ServerRole.User) { // Hanya proses pesan dari Bot/Admin
            processedMessage = {
              sender: senderType,
              message: content, // Gunakan 'message' sesuai MessageModel
              time: formattedTime,
              // rawData: data // Opsional
            };
            stopLoading = true; // Hentikan loading karena ini balasan sukses
        } else {
             console.log('ChatCoreService: Ignoring success message from self (User role).', data);
             // Untuk pesan dari user sendiri, kita mungkin tidak menghentikan loading di sini
             // kecuali server secara eksplisit mengirim sinyal 'pesan diterima'
             // Jika server tidak mengirim sinyal terpisah dan hanya konfirmasi sukses,
             // Anda mungkin perlu menghentikan loading di sini juga.
             // Mari kita hentikan loading juga jika server mengkonfirmasi sukses, bahkan dari user.
             stopLoading = true; // Hentikan loading jika server mengkonfirmasi sukses
        }


      } else {
        console.log('ChatCoreService: Received success message with no content.', data);
        stopLoading = true; // Hentikan loading jika sukses tanpa konten (misal: server hanya konfirmasi terima)
      }

    }
    // Format: {type: 'error', error: '...'}
    // Ini juga balasan terhadap pesan user jika terjadi error
    else if (data.type === 'error' && typeof data.error === 'string') {
        console.error('ChatCoreService: Received error message:', data.error);
         processedMessage = {
              sender: ENUM_SENDER.Chatbot, // Tampilkan error sebagai dari "Support" atau Chatbot
              message: `Error: ${data.error}`, // Gunakan 'message'
              time: new Date().toISOString(),
              // rawData: data // Opsional
          };
          stopLoading = true; // Hentikan loading setelah error
    }
    // Format: {type: 'info', message: '...'}
    // Pesan info, tidak selalu terkait balasan pesan user, biasanya tidak menghentikan loading kirim
    else if (data.type === 'info' && typeof data.message === 'string') {
         console.log('ChatCoreService: Received info message:', data.message);
          processedMessage = {
               sender: ENUM_SENDER.Chatbot, // Tampilkan info sebagai dari "Support" atau sender khusus
               message: `[INFO] ${data.message}`, // Gunakan 'message'. Prefiks info
               time: new Date().toISOString(),
               // rawData: data // Opsional
           };
           // stopLoading = false; // Info messages usually don't stop the main sending loading state.
    }
     // --- Handle tipe pesan lain dari server yang mungkin relevan untuk UI user ---
     // Tambahkan else if untuk tipe-tipe lain yang relevan dan ubah ke MessageModel jika perlu.
     // Contoh: status agen berubah, dll.
     // else if (data.type === 'agent_status_update') { ... }

    // --- Abaikan tipe pesan yang tidak relevan untuk UI user ---
    // Tipe pesan admin/internal akan diabaikan di sini.
    else if (data.type && ['room_message', 'chat_history', 'active_rooms_update', 'admin_room_joined', 'admin_room_left', 'admin_take_over_status', 'admin_hand_back_status'].includes(data.type)) {
        console.log(`ChatCoreService: Ignoring message type "${data.type}" for user widget.`);
        // Jangan lakukan apa-apa, jangan emit ke komponen user.
    }
    // Format lain yang tidak dikenali
    else {
        // Abaikan pesan sukses tanpa data atau from (mungkin hanya ACK?)
        if (!(data.success === true && (data.data === undefined || data.from === undefined))) {
             console.warn('ChatCoreService: Received unhandled raw message format:', data);
              // Opsional: Emit pesan error parse atau pesan tidak dikenali
             // processedMessage = { sender: ENUM_SENDER.Chatbot, message: 'Received unhandled message.', time: new Date().toISOString() };
        }
        // stopLoading = false; // Tidak menghentikan loading untuk format tidak dikenal
    }


    // Emit pesan yang sudah diproses jika ada
    if (processedMessage) {
      this._incomingMessages.next(processedMessage);
    }

    // Nonaktifkan loading hanya jika flag stopLoading true
    if (stopLoading) {
        this._isLoadingSending.next(false);
    }
  }

  // Metode ini dipanggil oleh komponen untuk memuat riwayat chat
  // loadHistory tidak butuh userId sebagai parameter karena service sudah punya _userId
  loadHistory(): Observable<MessageModel[]> {
    if (!this._userId) {
      console.error('ChatCoreService: Cannot load history, User ID is not set.');
      // Kembalikan Observable dengan error agar komponen bisa menanganinya
      return throwError(() => new Error("User ID not set for history load"));
    }

    console.log(`ChatCoreService: Loading chat history for user ID: ${this._userId}`);

    // Panggil service history, lalu map hasilnya (UserHistoryResponseModel)
    // ke format MessageModel[]
    return this.historyService.loadChatHistory(this._userId).pipe(
      // Response API adalah UserHistoryResponseModel, bukan array langsung
      map((response: UserHistoryResponseModel) => {
        console.log('ChatCoreService: Mapping history data:', response);

        // Pastikan respons dan array history ada
        if (!response || !response.history || response.history.length === 0) {
            console.log('ChatCoreService: No history data received.');
            return [];
        }

        const chats = response.history; // Ambil array history

        // Sort history by created_at
        chats.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeA - timeB;
        });

        // Map ke array MessageModel
        const historyMessages: MessageModel[] = chats
            .map(chat => { // Map setiap item ChatHistoryResponseModel
              // Gunakan created_at untuk waktu
              const formattedTime = chat.created_at?.slice(0, 16).replace('T', ' ') ?? '';
              let senderType: ENUM_SENDER;

              // Map server role ke ENUM_SENDER
              if (chat.role === ServerRole.User) {
                  senderType = ENUM_SENDER.User;
              } else if (chat.role === ServerRole.Admin || chat.role === ServerRole.Chatbot) {
                  // Asumsi Admin dan Chatbot ditampilkan sama di UI user
                  senderType = ENUM_SENDER.Chatbot; // Atau ENUM_SENDER.Support jika ada
              } else {
                 console.warn(`ChatCoreService: Unhandled role in history: ${chat.role}. Defaulting to Chatbot.`);
                 senderType = ENUM_SENDER.Chatbot;
              }

              // Buat MessageModel dari data history
              const message: MessageModel = {
                  sender: senderType,
                  message: chat.message || '', // Gunakan 'message' field
                  time: formattedTime,
                  // rawData: chat // Opsional
              };

              return message;
            })
            .filter(msg => msg.message); // Filter pesan dengan konten kosong

        console.log('ChatCoreService: Mapped history messages:', historyMessages);
        return historyMessages; // Mengembalikan array MessageModel
      }),
      catchError(err => {
         // Menangani error dari service history sebelum Observable dikirim ke komponen
         console.error('ChatCoreService: Failed to load or map history:', err);
         // Lempar kembali error agar komponen yang subscribe bisa menangkapnya
         return throwError(() => new Error('Failed to load chat history'));
      })
    );
  }

  ngOnDestroy(): void {
    console.log('ChatCoreService destroyed. Disconnecting WebSocket.');
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect(); // Pastikan koneksi WS terputus
    this._incomingMessages.complete();
    this._isLoadingSending.complete();
  }
}