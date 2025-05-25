import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WebSocketService } from '../services/admin-websocket.service';
import { SessionService } from '../services/session.service';
import { ENUM_SENDER } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model';
import { RoomConversationModel } from '../models/room.model';
import { ChatHistoryService } from '../services/chat-history.service';
import { RoomService } from '../services/room.service';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
// Import modul PrimeNG yang diperlukan
import { CardModule } from 'primeng/card'; // Sudah ada
import { ButtonModule } from 'primeng/button'; // Sudah ada
import { ListboxModule } from 'primeng/listbox'; // Sudah ada
import { BreadcrumbModule } from 'primeng/breadcrumb'; // Sudah ada
import { MenuItem } from 'primeng/api'; // Sudah ada
import { AvatarModule } from 'primeng/avatar'; // Baru ditambahkan
import { InputTextModule } from 'primeng/inputtext'; // Sudah ada (tapi perlu InputText untuk input text)
import { IconFieldModule } from 'primeng/iconfield'; // Baru ditambahkan
import { InputIconModule } from 'primeng/inputicon'; // Baru ditambahkan
import { TextareaModule } from 'primeng/textarea'; // Baru ditambahkan (untuk textarea)


@Component({
  selector: 'app-admin-chat',
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    HttpClientModule,
    CardModule,
    ButtonModule,
    ListboxModule,
    AvatarModule, // Tambahkan
    InputTextModule, // Pastikan ada, walaupun di template pakai pInputText
    IconFieldModule, // Tambahkan
    InputIconModule, // Tambahkan
    TextareaModule // Tambahkan
  ],
  standalone: true,
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss'],
})
export class AdminChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  public _arrayRoomModel: Array<RoomConversationModel>;
  public _modelSelectedRoom: RoomConversationModel | null;
  public _modelChatMessages: Record<string, MessageModel[]>;
  public _stringNewMessage: string;
  public _modelChatMessagesFlat: MessageModel[] = []; // Tidak digunakan langsung di template yang baru
  public _enumSender = ENUM_SENDER;
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;

  get filteredMessages() {
    return this._modelSelectedRoom?.id
      ? (this._modelChatMessages[this._modelSelectedRoom.id] || [])
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

      if (!message || !message.user_id) return;

      const roomIdentifier = message.user_id;

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];

      const time = new Date().toISOString();
      const formattedTime = time.slice(0, 16).replace("T", " ");

      // Logika penentuan sender tetap sama
      if (message.question) {
        this._modelChatMessages[roomIdentifier].push({ message: message.question, time: formattedTime, sender: this._enumSender.User });
      }

      if (message.output) {
        this._modelChatMessages[roomIdentifier].push({ message: message.output, time: formattedTime, sender: this._enumSender.Chatbot });
      }

      if (message.error) {
        this._modelChatMessages[roomIdentifier].push({ message: `❌ Error: ${message.error}`, time: formattedTime, sender: this._enumSender.Chatbot });
      }

      const roomIndex = this._arrayRoomModel.findIndex((r) => r.id === roomIdentifier);
      if (roomIndex !== -1) {
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

      // this.syncChatMessagesFlat(); // Tidak lagi perlu sinkronisasi ke flat array
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

  // onRoomReorder tidak lagi relevan dengan p-listbox tanpa orderlist
  // onRoomReorder(event: any) {
  //   console.log("Room reordered:", event.value);
  //   this._arrayRoomModel = [...event.value];
  // }

  async selectRoom(room: RoomConversationModel): Promise<void> {
    this._modelSelectedRoom = room;

    if (room.id) {
      this.chatHistoryService.loadChatHistoryByRoomId(room.id).subscribe({
        next: (response) => {
          const groupedChats: MessageModel[] = [];
          console.log("📜 Riwayat chat:", response);

          if (!response.success || !response.history || response.history.length === 0) {
            console.warn(`⚠️ Tidak ada riwayat chat untuk room ID ${room.id} atau permintaan gagal.`);
            this._modelChatMessages[room.id!] = [];
            // this.syncChatMessagesFlat(); // Tidak lagi perlu
            this.cdr.detectChanges();
            setTimeout(() => this.scrollToBottom(), 100);
            return;
          }

          response.history.forEach((chatItem) => {
            const formattedTime = chatItem.created_at
              ? chatItem.created_at.slice(0, 16).replace("T", " ")
              : new Date().toISOString().slice(0, 16).replace("T", " ");

            let senderType: ENUM_SENDER;
            switch (chatItem.role) {
              case 'user':
                senderType = this._enumSender.User;
                break;
              case 'admin':
                senderType = this._enumSender.Chatbot;
                break;
              case 'chatbot':
              default:
                senderType = this._enumSender.Chatbot;
                break;
            }
            groupedChats.push({ message: chatItem.message, time: formattedTime, sender: senderType });
          });

          groupedChats.sort((a, b) => new Date(a.time || '').getTime() - new Date(b.time || '').getTime());

          this._modelChatMessages[room.id!] = groupedChats;
          // this.syncChatMessagesFlat(); // Tidak lagi perlu

          const latestMessage = groupedChats.length > 0 ? groupedChats[groupedChats.length - 1] : null;
          const roomToUpdate = this._arrayRoomModel.find(r => r.id === room.id);
          if (roomToUpdate && latestMessage) {
            roomToUpdate.lastMessage = latestMessage.message;
            roomToUpdate.lastTimeMessage = latestMessage.time;
            this._arrayRoomModel = [...this._arrayRoomModel];
          }

          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          console.error(`❌ Gagal memuat chat history untuk room ID ${room.id}:`, err);
          this._modelChatMessages[room.id!] = [];
          // this.syncChatMessagesFlat(); // Tidak lagi perlu
          this.cdr.detectChanges();
        },
      });
    } else {
      alert("⚠️ ID room tidak valid.");
      this._modelSelectedRoom = null;
      this._modelChatMessages[''] = [];
      // this.syncChatMessagesFlat(); // Tidak lagi perlu
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
        }
        // Tidak lagi otomatis memilih room pertama jika tidak ada yang terpilih, biarkan pesan "Pilih user" muncul
      },
      error: (err) => {
        console.error('Gagal memuat daftar room:', err);
      },
    });
  }

  // getMessages() tidak lagi diperlukan karena langsung menggunakan filteredMessages
  // public getMessages(): MessageModel[] {
  //   return this._modelChatMessages[this._modelSelectedRoom?.id || ''] || [];
  // }

  // syncChatMessagesFlat() tidak lagi diperlukan
  // public syncChatMessagesFlat(): void {
  //   this._modelChatMessagesFlat = Object.entries(this._modelChatMessages).flatMap(([roomIdentifier, msgs]) =>
  //     msgs.map(msg => ({ ...msg, roomIdentifier }))
  //   );
  // }

  public scrollToBottom(): void {
    try {
      if (this.chatScroll && this.chatScroll.nativeElement) {
        const el = this.chatScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      // console.error("❌ Gagal scroll:", err);
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
        user_id: adminId, // ID admin yang mengirim
        role: 'admin',
        room_id: this._modelSelectedRoom.id,
        target_user_id: this._modelSelectedRoom.id, // Target user adalah ID room yang dipilih
        message: this._stringNewMessage,
      };

      this.webSocketService.sendMessage(payload);

      const roomIdentifier = this._modelSelectedRoom.id!;

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];
      this._modelChatMessages[roomIdentifier].push({
        message: this._stringNewMessage,
        time: formattedTime,
        sender: this._enumSender.Admin, // Admin mengirim dan tampil sebagai Admin
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

      // this.syncChatMessagesFlat(); // Tidak lagi perlu
      this.cdr.detectChanges();
      this._stringNewMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    }
  }
}