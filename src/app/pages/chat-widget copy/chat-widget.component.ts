// src/app/components/chat-widget/chat-widget.component.ts
// Hapus import WebSocketService dan ChatHistoryService, SessionService tetap
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SessionService } from '../services/session.service'; // SessionService tetap
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
// ENUM_SENDER dan ServerRole tetap dibutuhkan
import { ENUM_SENDER, ServerRole } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model';
// Import yang Anda berikan
import { ChatHistoryResponseModel } from '../models/chat_history_response.model';

// --- Import ChatCoreService yang baru ---
import { ChatCoreService } from '../services/user-chat-core.service';
// ----------------------------------------


@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  // Pastikan templateUrl merujuk ke file HTML yang akan kita perbarui
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  public _chatMessages: MessageModel[] = []; // Struktur data pesan tetap di komponen
  // --- Hapus properti _booleanIsloading ---
  // public _booleanIsloading: boolean = false; // Hapus properti ini
  // booleanIsBlocking bisa tetap jika digunakan untuk UI blocking spesifik komponen (bukan loading kirim pesan)
  public _booleanIsBlocking: boolean = false;
  public _booleanIsOpen: boolean = false;
  public _booleanShowNotificationBubble: boolean = false;

  // Menggunakan ENUM_SENDER untuk mapping sender di UI
  public _enumSender = ENUM_SENDER;
  // User ID bisa tetap disimpan di komponen jika sering dibutuhkan untuk UI
  private _stringUserID: string | null = null;
  public _numberUnreadMessageCount: number = 0;

  // Status WS dari service (optional, bisa juga pakai | async di HTML)
  public wsStatus: string = 'disconnected';

  // Subject untuk cleanup langganan komponen
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService, // SessionService tetap dibutuhkan untuk mendapatkan User ID
    private cdr: ChangeDetectorRef,
    // --- Inject ChatCoreService ---
    public chatCoreService: ChatCoreService // Jadikan public agar bisa diakses di template
    // ----------------------------
  )
  {
    // Konstruktor: Hanya untuk injection dan inisialisasi properti dasar
    // Logika inisialisasi chat dilakukan di ngOnInit setelah session siap
  }

  // ngOnInit tidak perlu async
  ngOnInit(): void
  {
    console.log('ChatWidgetComponent initializing...');

    // Langganan status inisialisasi SessionService
    // ChatCoreService sudah melanggan ini sendiri, komponen hanya perlu menunggu ID user lokal
    this.sessionService.initializationStatus$
      .pipe(
          filter(isInitialized => isInitialized === true), // Proses hanya ketika statusnya true
          takeUntil(this.destroy$) // Otomatis unsubscribe saat komponen dihancurkan
      )
      .subscribe(() => {
          console.log('Session initialization complete in widget. Getting User ID.');
          this._stringUserID = this.sessionService.getUserId(); // Ambil User ID setelah session siap

          if (this._stringUserID)
          {
              console.log(`User ID obtained: ${this._stringUserID}. Subscribing to ChatCoreService streams.`);
              // --- HAPUS: Inisialisasi ChatCoreService di sini ---
              // this.chatCoreService.initialize(this._stringUserID); // Hapus baris ini! Service menginisialisasi dirinya sendiri.

              // --- Langganan pesan masuk dari ChatCoreService ---
              this.chatCoreService.incomingMessages$
                .pipe(takeUntil(this.destroy$)) // Komponen unsubscribe saat dihancurkan
                .subscribe(message => { // Menerima objek MessageModel yang sudah diproses dari service
                  console.log('Widget received processed message:', message);
                  this._chatMessages.push(message); // Tambahkan pesan ke array pesan lokal komponen
                  this.cdr.detectChanges(); // Beri tahu Angular view perlu diperbarui
                  setTimeout(() => this.handleScrollToBottom(), 50); // Scroll ke bawah

                  // Logika notifikasi pesan belum dibaca jika widget tertutup
                  if (!this._booleanIsOpen) {
                      this._numberUnreadMessageCount++;
                      this._booleanShowNotificationBubble = true;
                      this.cdr.detectChanges();
                  }
              });

              // --- Langganan status loading kirim dari ChatCoreService ---
              // Tidak perlu berlangganan ke _booleanIsloading lokal jika pakai | async di HTML
               this.chatCoreService.isLoadingSending$
                   .pipe(takeUntil(this.destroy$))
                   .subscribe(isLoading => {
                       // Jika Anda tetap ingin properti lokal untuk alasan lain, definisikan _booleanIsloading lagi.
                       // Tapi untuk loading indicator saja, | async lebih bersih.
                       // this._booleanIsloading = isLoading; // Jika _booleanIsloading didefinisikan
                       this.cdr.detectChanges(); // Perbarui tampilan loading jika status berubah
                   });


              // --- Muat riwayat chat dari ChatCoreService ---
               // Aktifkan blocking UI saat memuat history awal
              this._booleanIsBlocking = true; // Gunakan properti blocking yang ada
              this.chatCoreService.loadHistory() // Panggil loadHistory dari service
                .pipe(takeUntil(this.destroy$)) // Komponen unsubscribe dari Observable history
                .subscribe({
                    next: historyMessages => { // Menerima array MessageModel[] dari service
                      console.log('Widget received history:', historyMessages);
                      this._chatMessages = historyMessages; // Ganti array pesan lokal dengan history
                      this._booleanIsBlocking = false; // Nonaktifkan blocking
                      this.cdr.detectChanges(); // Beri tahu Angular untuk update tampilan
                      setTimeout(() => this.handleScrollToBottom(), 50); // Scroll ke bawah
                  },
                    error: err => {
                        console.error('Widget failed to load history:', err);
                         this._booleanIsBlocking = false; // Nonaktifkan blocking meskipun error
                         this.cdr.detectChanges();
                         // Tampilkan pesan error ke user di UI jika perlu
                    }
                });

              // --- Langganan status koneksi dari ChatCoreService ---
               this.chatCoreService.wsConnectionStatus$
                   .pipe(takeUntil(this.destroy$))
                   .subscribe(status => {
                       this.wsStatus = status; // Update status lokal
                       this.cdr.detectChanges(); // Perbarui UI status koneksi
                   });


          }
          else
          {
              console.error('User ID is null after session initialization complete. Cannot setup chat widget.');
              // Tampilkan pesan error ke user
          }
      });

  }

  ngAfterViewInit(): void
  {
    // ...
  }

  ngOnDestroy(): void
  {
    console.log('ChatWidgetComponent is being destroyed.');
    this.destroy$.next();
    this.destroy$.complete();
    // ChatCoreService (providedIn: 'root') mengelola lifecycle koneksi WS-nya sendiri.
  }

  // connectWebSocket, subscribeToWebSocketMessages, subscribeToWebSocketStatus,
  // loadHistoryChat, handleWebSocketMessage, withBlocking dipindahkan ke ChatCoreService atau tidak dibutuhkan.

  // Metode untuk menampilkan/menyembunyikan widget chat
  public toggleChat(): void // Metode ini tetap di komponen karena ini interaksi UI
  {
    this._booleanIsOpen = !this._booleanIsOpen;
    this._booleanShowNotificationBubble = false;
    this._numberUnreadMessageCount = 0;

    if (this._booleanIsOpen) {
       // Scroll ke bawah saat membuka widget
      setTimeout(() => this.handleScrollToBottom(), 100);
    }
  }

  // Metode untuk mengirim pesan user
  public sendMessage() // Metode ini tetap di komponen karena ini interaksi UI
  {
    const messageText = this.userInput.nativeElement.value.trim();
    if (!messageText || !this._stringUserID) {
        console.warn("Cannot send message: text is empty or User ID is missing.");
        return;
    }

    // Tambahkan pesan user ke array tampilan secara optimis (sebelum konfirmasi server)
    const formattedTime = new Date().toISOString();
    const newMessage: MessageModel =
    {
      message: messageText,
      time: formattedTime,
      sender: this._enumSender.User
    };
    this._chatMessages.push(newMessage); // Tambahkan ke array pesan lokal komponen
    this.handleScrollToBottom(); // Scroll ke bawah

    // --- Panggil sendMessage dari ChatCoreService ---
    // Service yang akan mengurus payload dan pengiriman WS, serta update status loading kirim.
    this.chatCoreService.sendMessage(messageText);

    // Kosongkan input
    this.userInput.nativeElement.value = '';

    // Status loading kirim diatur oleh service dan diakses di template via | async
  }

  // Metode untuk scroll ke pesan terakhir di tampilan chat
  public handleScrollToBottom(): void // Metode ini tetap di komponen karena interaksi ViewChild
  {
    try
    {
      setTimeout(() => {
          if (this.chatScroll && this.chatScroll.nativeElement)
          {
            const el = this.chatScroll.nativeElement;
            el.scrollTop = el.scrollHeight;
          }
      }, 0);
    }
    catch (err)
    {
      console.error("❌ Failed to scroll:", err);
    }
  }

  // Getter untuk mengakses status loading dari service di template (Opsional)
  // Karena properti chatCoreService dibuat public, Anda bisa langsung pakai:
  // *ngIf="(chatCoreService.isLoadingSending$ | async)" di HTML
  // get isLoading(): Observable<boolean> {
  //    return this.chatCoreService.isLoadingSending$;
  // }
}