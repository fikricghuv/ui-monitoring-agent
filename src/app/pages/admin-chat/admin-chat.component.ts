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
import { CardModule } from 'primeng/card'; 
import { ButtonModule } from 'primeng/button'; 
import { ListboxModule } from 'primeng/listbox'; 
import { BreadcrumbModule } from 'primeng/breadcrumb'; 
import { MenuItem } from 'primeng/api'; 
import { AvatarModule } from 'primeng/avatar'; 
import { InputTextModule } from 'primeng/inputtext'; 
import { IconFieldModule } from 'primeng/iconfield'; 
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea'; 
import { MessageService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast'; 

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
    AvatarModule, 
    InputTextModule, 
    IconFieldModule, 
    InputIconModule, 
    TextareaModule ,
    ToastModule
  ],
  standalone: true,
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss'],
  providers: [MessageService]

})
export class AdminChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  public _arrayRoomModel: Array<RoomConversationModel>;
  public _modelSelectedRoom: RoomConversationModel | null;
  public _modelChatMessages: Record<string, MessageModel[]>;
  public _stringNewMessage: string;
  public _modelChatMessagesFlat: MessageModel[] = []; 
  public _enumSender = ENUM_SENDER;
  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;
  public _searchRoomQuery: string = '';

  get filteredMessages() 
  {
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
    private roomService: RoomService,
    private messageService: MessageService
  ) 
  {
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

        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'WebSocket berhasil terhubung.'
        });

      } catch (error) {
        console.error("❌ Gagal menghubungkan WebSocket admin:", error);

        this.messageService.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghubungkan WebSocket admin.'
        });

      }
    } else {
      console.warn("Admin ID tidak ditemukan.");
      this.messageService.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Admin ID tidak ditemukan.'
      });
    }

    this.newMessageSubscription = this.webSocketService.getMessages().subscribe((message) => {
      console.log("📨 Pesan baru dari WebSocket:", message);

      if (!message || !message.user_id) return;

      const roomIdentifier = message.user_id;

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];

      const currentTime = new Date().toISOString(); 

      if (message.question) {
        this._modelChatMessages[roomIdentifier].push({ message: message.question, time: currentTime, sender: this._enumSender.User });
      }

      if (message.output) {
        this._modelChatMessages[roomIdentifier].push({ message: message.output, time: currentTime, sender: this._enumSender.Chatbot });
      }

      if (message.error) {
        this._modelChatMessages[roomIdentifier].push({ message: `❌ Error: ${message.error}`, time: currentTime, sender: this._enumSender.Chatbot });
      }

      const roomIndex = this._arrayRoomModel.findIndex((r) => r.id === roomIdentifier);
      if (roomIndex !== -1) {

        let lastMsgText = '';
        
        if (message.output) {
          lastMsgText = message.output;
        } else if (message.question) { 
          lastMsgText = message.question;
        } else if (message.error) { 
          lastMsgText = `❌ Error: ${message.error}`;
        }

        this._arrayRoomModel[roomIndex].lastMessage = lastMsgText;
        
        this._arrayRoomModel[roomIndex].lastTimeMessage = currentTime;
        
        this._arrayRoomModel = [...this._arrayRoomModel]; 

        this._arrayRoomModel.sort((a, b) =>
          new Date(b.lastTimeMessage || 0).getTime() - new Date(a.lastTimeMessage || 0).getTime()
        );
      }

      this.cdr.detectChanges();
      setTimeout(() => this.scrollToBottom(), 100);
    });

    this._listMenuItems = [
      { label: 'Admin Chat' }
    ];
    this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.newMessageSubscription?.unsubscribe();
  }

  get filteredRooms(): RoomConversationModel[] {
    if (!this._searchRoomQuery.trim()) {
      return this._arrayRoomModel;
    }

    const query = this._searchRoomQuery.toLowerCase();

    return this._arrayRoomModel.filter(room =>
      room.id?.toLowerCase().includes(query) ||
      room.lastMessage?.toLowerCase().includes(query)
    );
  }

  async selectRoom(room: RoomConversationModel): Promise<void> {
    
    this._modelSelectedRoom = room;

    if (room.id) {
      this.chatHistoryService.loadChatHistoryByRoomId(room.id).subscribe({

        next: (response) => {
          const groupedChats: MessageModel[] = [];
          
          console.log("📜 Riwayat chat:", response);

          if (!response.success || !response.history || response.history.length === 0) {
            console.warn(`⚠️ Tidak ada riwayat chat untuk room ID ${room.id} atau permintaan gagal.`);

            this.messageService.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Tidak ada riwayat chat untuk room ini.'
            });
            
            this._modelChatMessages[room.id!] = [];

            this.cdr.detectChanges();
            
            setTimeout(() => this.scrollToBottom(), 100);

            return;
          }

          response.history.forEach((chatItem) => {
            
            const formattedTime = chatItem.created_at 
              ? chatItem.created_at 
              : new Date().toISOString(); 

            let senderType: ENUM_SENDER;
            
            switch (chatItem.role) {
              case 'user':
                senderType = this._enumSender.User;
                break;
              case 'admin':
                senderType = this._enumSender.Admin; 
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

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Gagal memuat riwayat chat untuk room ini.`
          });
          
          this._modelChatMessages[room.id!] = [];
          
          this.cdr.detectChanges();
        },
      });
    } else {

      this.messageService.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Room tidak valid.'
      });
      
      this._modelSelectedRoom = null;
      
      this._modelChatMessages[''] = [];
      
      this.cdr.detectChanges();
    }
  }

  public loadRooms(): void {
    this.roomService.getActiveRooms().pipe(
      map((rooms: RoomConversationModel[]) => rooms.map(room => {
        
        const serverLastMessage = room.lastMessage || '';
        const serverLastTimeMessage = room.lastTimeMessage; 

        let finalLastMessage = serverLastMessage;
        let finalLastTimeMessage: string;

        if (serverLastTimeMessage) {
          finalLastTimeMessage = serverLastTimeMessage;

        } else if (room.updated_at) {
          finalLastTimeMessage = new Date(room.updated_at).toISOString();

        } else if (room.created_at) {
          finalLastTimeMessage = new Date(room.created_at).toISOString();

        } else {
          finalLastTimeMessage = new Date().toISOString();
        }

        if (!finalLastMessage && finalLastTimeMessage) {
            finalLastMessage = ''; 
        }

        return {
          ...room,
          lastMessage: finalLastMessage,
          lastTimeMessage: finalLastTimeMessage,
        };
      })),
      tap(rooms => {
        
        rooms.sort((a, b) =>
          new Date(b.lastTimeMessage || '').getTime() - new Date(a.lastTimeMessage || '').getTime()
        );
      })
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

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Gagal memuat daftar room:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat daftar chat. Silakan coba lagi nanti.'
        });

      },
    });
  }

  public scrollToBottom(): void {
    try {
      if (this.chatScroll && this.chatScroll.nativeElement) {
        
        const el = this.chatScroll.nativeElement;
        
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      console.error("❌ Gagal scroll:", err);
    }
  }

  public async sendMessageFromAdmin(): Promise<void> {
    if (!this._stringNewMessage.trim() || !this._modelSelectedRoom || !this._modelSelectedRoom.id) {
      console.warn("Pesan kosong atau tidak ada room yang dipilih atau ID room tidak valid.");
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Pesan tidak boleh kosong atau room tidak valid.'
      });
      
      return;
    }

    const currentTime = new Date().toISOString(); 
    
    const adminId = this.sessionService.getAdminId();

    try {
      const payload = {
        type: "message",
        user_id: adminId, 
        role: 'admin',
        room_id: this._modelSelectedRoom.id,
        target_user_id: this._modelSelectedRoom.id, 
        message: this._stringNewMessage,
      };

      this.webSocketService.sendMessage(payload);

      const roomIdentifier = this._modelSelectedRoom.id!;

      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];
      
      this._modelChatMessages[roomIdentifier].push({
        message: this._stringNewMessage,
        time: currentTime, 
        sender: this._enumSender.Admin, 
      });

      const roomToUpdate = this._arrayRoomModel.find(r => r.id === this._modelSelectedRoom?.id);
      
      if (roomToUpdate) 
      {
        roomToUpdate.lastMessage = this._stringNewMessage;
        
        roomToUpdate.lastTimeMessage = currentTime;
        
        this._arrayRoomModel = [...this._arrayRoomModel];
        this._arrayRoomModel.sort((a, b) =>
          new Date(b.lastTimeMessage || '').getTime() - new Date(a.lastTimeMessage || '').getTime()
        );
      }

      this.cdr.detectChanges();
      
      this._stringNewMessage = '';
      
      setTimeout(() => this.scrollToBottom(), 100);

    } catch (error) {
      console.error('Gagal mengirim pesan:', error);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal mengirim pesan. Silakan coba lagi nanti.'
      });
    }
  }

  public onSearchChatHistory(): void {
    if (!this._modelSelectedRoom?.id) return;

    this.selectRoom(this._modelSelectedRoom);
  }

  public onRefreshData(): void {
    
    this.loadRooms();
    this.messageService.add({
        severity: 'success',
        summary: 'Refreshed',
        detail: 'Data has been refreshed.'
    });
  }


}