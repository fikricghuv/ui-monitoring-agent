import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WebSocketService } from '../services/admin-websocket.service';
import { SessionService } from '../services/session.service';
// import { DomSanitizer } from '@angular/platform-browser'; // Hapus jika tidak digunakan
import { ENUM_SENDER } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model';
import { RoomConversationModel } from '../models/room.model';
import { ChatHistoryService } from '../services/chat-history.service';
import { RoomService } from '../services/room.service';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OrderListModule } from 'primeng/orderlist';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, 
    BreadcrumbModule, HttpClientModule, OrderListModule, CardModule, ButtonModule, ListboxModule],
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  public _arrayRoomModel: Array<RoomConversationModel>;
  public _modelSelectedRoom: RoomConversationModel | null;
  public _modelChatMessages: Record<string, MessageModel[]>; // Kunci akan menjadi room.id
  public _stringNewMessage: string;
  public _modelChatMessagesFlat: MessageModel[] = [];
  public _enumSender = ENUM_SENDER;
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;

  get filteredMessages() {
    // Menggunakan _modelSelectedRoom.id sebagai kunci.
    return this._modelSelectedRoom?.id
      ? (this._modelChatMessages[this._modelSelectedRoom.id] || []).filter(msg => msg.message) // Perubahan: menggunakan msg.text
      : [];
  }

  private newMessageSubscription?: Subscription;

  constructor(
    private webSocketService: WebSocketService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private chatHistoryService: ChatHistoryService,
    private roomService: RoomService
  ) {
    this._arrayRoomModel = [];
    this._modelSelectedRoom = null;
    this._modelChatMessages = {};
    this._stringNewMessage = '';
    this._modelChatMessagesFlat = [];
    
  }

  async ngOnInit() {
    this.loadRooms();

    const adminId = this.sessionService.getAdminId();
    if (adminId) {
      try {
        await this.webSocketService.connect(adminId, 'admin');
        console.log("✅ WebSocket admin terhubung.");
      } catch (error) {
        console.error("❌ Gagal menghubungkan WebSocket admin:", error);
      }
    } else {
      console.warn("Admin ID tidak ditemukan.");
    }

    this.newMessageSubscription = this.webSocketService.getMessages().subscribe((message) => {
      console.log("📨 Pesan baru dari WebSocket:", message);

      // Asumsi message.user_id sekarang merujuk pada room.id
      if (!message || !message.user_id) return;

      const roomIdentifier = message.user_id; // Ini adalah room.id

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];

      const time = new Date().toISOString();
      const formattedTime = time.slice(0, 16).replace("T", " ");

      // Berdasarkan pesan dari WebSocket, kita perlu tahu siapa pengirimnya
      // Jika WebSocket mengirimkan role, gunakan itu. Jika tidak, tentukan berdasarkan sumber pesan.
      // Untuk pesan dari user (question), sender adalah User.
      // Untuk pesan dari bot/admin (output/error), sender adalah Chatbot.

      if (message.question) { // Pesan dari user (diterima dari user ke admin)
        this._modelChatMessages[roomIdentifier].push({ message: message.question, time: formattedTime, sender: this._enumSender.User });
      }

      if (message.output) { // Pesan dari chatbot (jawaban untuk user)
        this._modelChatMessages[roomIdentifier].push({ message: message.output, time: formattedTime, sender: this._enumSender.Chatbot });
      }

      if (message.error) { // Error dari chatbot
        this._modelChatMessages[roomIdentifier].push({ message: `❌ Error: ${message.error}`, time: formattedTime, sender: this._enumSender.Chatbot });
      }
      
      // Jika ada pesan yang dikirim oleh admin melalui WebSocket dan diterima di sini (misalnya broadcast)
      // Anda perlu logika tambahan untuk menentukan sender berdasarkan message.role jika ada.

      const roomIndex = this._arrayRoomModel.findIndex((r) => r.id === roomIdentifier);
      if (roomIndex !== -1) {
        // Ambil teks pesan terakhir yang relevan untuk ditampilkan di daftar room
        let lastMsgText = '';
        if (message.question) lastMsgText = message.question;
        else if (message.output) lastMsgText = message.output;
        else if (message.error) lastMsgText = `❌ Error: ${message.error}`;
        
        this._arrayRoomModel[roomIndex].lastMessage = lastMsgText;
        this._arrayRoomModel[roomIndex].lastTimeMessage = formattedTime;
        this._arrayRoomModel.sort((a, b) =>
          new Date(b.lastTimeMessage || 0).getTime() - new Date(a.lastTimeMessage || 0).getTime()
        );
      }

      this.syncChatMessagesFlat();
      this.cdr.detectChanges();
      setTimeout(() => this.scrollToBottom(), 100);
    });
    this.items = [
            { label: 'Admin Chat' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.newMessageSubscription?.unsubscribe();
  }

  onRoomReorder(event: any) {
    // Logika ketika daftar room di-reorder
    // event.value akan berisi daftar room yang sudah di-reorder
    // Anda mungkin perlu memperbarui _arrayRoomModel di sini
    console.log("Room reordered:", event.value);
    this._arrayRoomModel = [...event.value]; // Memastikan _arrayRoomModel terupdate dan trigger change detection
  }

  async selectRoom(room: RoomConversationModel): Promise<void> {
    this._modelSelectedRoom = room;

    if (room.id) { 
      this.chatHistoryService.loadChatHistoryByRoomId(room.id).subscribe({
        next: (response) => { // response adalah UserHistoryResponseModel
          const groupedChats: MessageModel[] = [];
          console.log("📜 Riwayat chat:", response);

          if (!response.success || !response.history || response.history.length === 0) {
            console.warn(`⚠️ Tidak ada riwayat chat untuk room ID ${room.id} atau permintaan gagal.`);
            this._modelChatMessages[room.id!] = []; // Pastikan room.id tidak null
            this.syncChatMessagesFlat(); // Sinkronkan meskipun kosong
            this.cdr.detectChanges(); // Update view
            setTimeout(() => this.scrollToBottom(), 100); // Scroll jika ada elemen chatbox
            return;
          }

          response.history.forEach((chatItem) => { // chatItem adalah ChatHistoryResponseModel
            const formattedTime = chatItem.created_at
              ? chatItem.created_at.slice(0, 16).replace("T", " ")
              : new Date().toISOString().slice(0, 16).replace("T", " "); // Fallback jika created_at null

            let senderType: ENUM_SENDER;
            switch (chatItem.role) {
              case 'user':
                senderType = this._enumSender.User;
                break;
              case 'admin': // Admin bisa dianggap sebagai Chatbot atau jenis sender lain
                senderType = this._enumSender.Chatbot; // Atau ENUM_SENDER.Admin jika ada
                break;
              case 'chatbot':
              default:
                senderType = this._enumSender.Chatbot;
                break;
            }
            // Menggunakan properti 'text' untuk MessageModel
            groupedChats.push({ message: chatItem.message, time: formattedTime, sender: senderType });
          });

          // Urutkan groupedChats berdasarkan waktu jika belum terurut dari server
          groupedChats.sort((a, b) => new Date(a.time || '').getTime() - new Date(b.time || '').getTime());

          this._modelChatMessages[room.id!] = groupedChats; // Gunakan room.id sebagai kunci
          this.syncChatMessagesFlat();

          const latestMessage = groupedChats.length > 0 ? groupedChats[groupedChats.length - 1] : null;
          const roomToUpdate = this._arrayRoomModel.find(r => r.id === room.id);
          if (roomToUpdate && latestMessage) {
            roomToUpdate.lastMessage = latestMessage.message; // Menggunakan .text dari MessageModel
            roomToUpdate.lastTimeMessage = latestMessage.time;
            // Tidak perlu re-sort _arrayRoomModel di sini karena ini hanya update info,
            // sorting utama terjadi di loadRooms dan saat pesan baru dari WebSocket.
            this._arrayRoomModel = [...this._arrayRoomModel]; // Trigger change detection
          }

          this.cdr.detectChanges(); // Pastikan view diupdate setelah memuat history
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          // Error sudah di-handle di service, tapi bisa tambahkan logika UI spesifik di sini
          console.error(`❌ Gagal memuat chat history untuk room ID ${room.id}:`, err);
          this._modelChatMessages[room.id!] = []; // Kosongkan jika ada error
          this.syncChatMessagesFlat();
          this.cdr.detectChanges();
        },
      });
    } else {
      alert("⚠️ ID room tidak valid.");
      this._modelSelectedRoom = null; // Reset selected room jika ID tidak valid
      this._modelChatMessages[''] = []; // Kosongkan pesan jika ada
      this.syncChatMessagesFlat();
      this.cdr.detectChanges();
    }
  }


  public loadRooms(): void {
    this.roomService.getActiveRooms().pipe(
      map((rooms: RoomConversationModel[]) => rooms.map(room => ({
        ...room,
        lastMessage: room.lastMessage || '',
        lastTimeMessage: room.lastTimeMessage ||
                         (room.updated_at
                            ? new Date(room.updated_at).toISOString().slice(0, 16).replace("T", " ")
                            : (room.created_at
                                ? new Date(room.created_at).toISOString().slice(0, 16).replace("T", " ")
                                : '')),
      }))),
      tap(rooms => rooms.sort((a, b) =>
        new Date(b.lastTimeMessage || 0).getTime() - new Date(a.lastTimeMessage || 0).getTime()
      ))
    ).subscribe({
      next: (rooms) => {
        this._arrayRoomModel = rooms;
        if (this._modelSelectedRoom && this._modelSelectedRoom.id) {
            const currentSelected = rooms.find(r => r.id === this._modelSelectedRoom!.id);
            if (currentSelected) {
                this._modelSelectedRoom = currentSelected;
            } else {
                this._modelSelectedRoom = null;
            }
        } else if (rooms.length > 0 && !this._modelSelectedRoom) {
            // Opsi: Pilih room pertama secara otomatis jika tidak ada yang terpilih
            // this.selectRoom(rooms[0]);
        }
      },
      error: (err) => {
        console.error('Gagal memuat daftar room:', err);
      },
    });
  }

  public getMessages(): MessageModel[] {
    return this._modelChatMessages[this._modelSelectedRoom?.id || ''] || [];
  }

  public syncChatMessagesFlat(): void {
    this._modelChatMessagesFlat = Object.entries(this._modelChatMessages).flatMap(([roomIdentifier, msgs]) =>
      msgs.map(msg => ({ ...msg, roomIdentifier }))
    );
  }

  public scrollToBottom(): void {
    try {
      if (this.chatScroll && this.chatScroll.nativeElement) {
        const el = this.chatScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      // console.error("❌ Gagal scroll:", err); // Bisa di-uncomment jika perlu
    }
  }

  public async sendMessageFromAdmin(): Promise<void> {
    if (!this._stringNewMessage.trim() || !this._modelSelectedRoom || !this._modelSelectedRoom.id) {
        console.warn("Pesan kosong atau tidak ada room yang dipilih atau ID room tidak valid.");
        return;
    }

    const formattedTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const adminId = this.sessionService.getAdminId();

    try {
      const payload = {
        type: "message",
        user_id: adminId,
        role: 'admin',
        room_id: this._modelSelectedRoom.id,
        target_user_id: "",
        message: this._stringNewMessage,
      };

      this.webSocketService.sendMessage(payload);

      const roomIdentifier = this._modelSelectedRoom.id!;

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];
      this._modelChatMessages[roomIdentifier].push({
        message: this._stringNewMessage, // Menggunakan 'text'
        time: formattedTime,
        sender: this._enumSender.Chatbot, // Admin mengirim dan tampil sebagai Chatbot (atau ENUM_SENDER.Admin)
      });

      const roomToUpdate = this._arrayRoomModel.find(r => r.id === this._modelSelectedRoom?.id);
      if (roomToUpdate) {
        roomToUpdate.lastMessage = this._stringNewMessage;
        roomToUpdate.lastTimeMessage = formattedTime;
        this._arrayRoomModel.sort((a, b) =>
          new Date(b.lastTimeMessage || 0).getTime() - new Date(a.lastTimeMessage || 0).getTime()
        );
        this._arrayRoomModel = [...this._arrayRoomModel];
      }

      this.syncChatMessagesFlat();
      this.cdr.detectChanges();
      this._stringNewMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    }
  }
}