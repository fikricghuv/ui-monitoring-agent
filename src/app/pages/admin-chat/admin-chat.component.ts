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
  private _lastCursor?: string;

  private _chatCursors: Record<string, string | null> = {};
  private _isLoadingChatMore = false;


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
      console.log("📨 Pesan baru dari WebSocket ke admin:", message);

      if (!message || !message.room_id) return;

      const roomIdentifier = message.room_id;
      this._modelChatMessages[roomIdentifier] = this._modelChatMessages[roomIdentifier] || [];

      const currentTime = new Date().toISOString(); 

      let senderType = this._enumSender.User; // default
      if (message.role === 'user') {
        senderType = this._enumSender.User;
      } else if (message.role === 'admin' || message.role === 'chatbot') {
        // chatbot dan admin disamakan → bubble kanan
        senderType = this._enumSender.Admin;
      }

      // handle error khusus
      let textMessage = message.message || '';
      if (message.error) {
        textMessage = `❌ Error: ${message.error}`;
        senderType = this._enumSender.Admin; // error tetap tampil di kanan
      }

      this._modelChatMessages[roomIdentifier].push({
        message: textMessage,
        time: currentTime,
        sender: senderType,
      });

      // update preview di daftar room
      const roomIndex = this._arrayRoomModel.findIndex((r) => r.id === roomIdentifier);
      if (roomIndex !== -1) {
        let lastMsgText = '';

        if (message.output) {
          lastMsgText = message.output;
        } else if (message.question) {
          lastMsgText = message.question;
        } else if (message.error) {
          lastMsgText = `❌ Error: ${message.error}`;
        } else if (message.message) {
          lastMsgText = message.message;
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

    if (this.chatScroll?.nativeElement) {
      this.chatScroll.nativeElement.addEventListener('scroll', this.onRoomListScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.newMessageSubscription?.unsubscribe();

    if (this.chatScroll?.nativeElement) {
      this.chatScroll.nativeElement.removeEventListener('scroll', this.onRoomListScroll.bind(this));
    }
  }

  private _isLoadingMore = false;

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
      this._chatCursors[room.id] = null; 
      this._modelChatMessages[room.id] = [];
      this.loadMoreChats(room.id);

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

  public loadMoreChats(roomId: string): void {
    if (this._isLoadingChatMore) return;
    this._isLoadingChatMore = true;

    const cursor = this._chatCursors[roomId] || undefined;

    this.chatHistoryService.loadChatHistoryByRoomId(roomId, cursor).subscribe({
      next: (response) => {
        if (response.success && response.history && response.history.length > 0) {
          const mappedChats = response.history.map(chatItem => {
            const formattedTime = chatItem.created_at || new Date().toISOString();

            let senderType: ENUM_SENDER;
            switch (chatItem.role) {
              case 'user': senderType = this._enumSender.User; break;
              case 'admin': senderType = this._enumSender.Admin; break;
              default: senderType = this._enumSender.Chatbot;
            }

            return { message: chatItem.message, time: formattedTime, sender: senderType };
          });

          // prepend (karena kita load history lama di atas)
          this._modelChatMessages[roomId] = [
            ...mappedChats,
            ...(this._modelChatMessages[roomId] || [])
          ];

          // update cursor ke pesan paling lama
          const oldest = mappedChats[0];
          if (oldest) {
            this._chatCursors[roomId] = oldest.time; 
          }
        }
        this._isLoadingChatMore = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`❌ Gagal load chat history:`, err);
        this._isLoadingChatMore = false;
      },
    });
  }


  public loadRooms(cursor?: string): void {
    this.roomService.getActiveRooms(cursor).pipe(
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
        // kalau load awal, replace
        if (!cursor) {
          this._arrayRoomModel = rooms;
        } else {
          // kalau load berikutnya (load more), append
          this._arrayRoomModel = [...this._arrayRoomModel, ...rooms];
        }

        // update selected
        if (this._modelSelectedRoom?.id) {
          const currentSelected = this._arrayRoomModel.find(r => r.id === this._modelSelectedRoom!.id);
          this._modelSelectedRoom = currentSelected ?? null;
        }

        // simpan cursor untuk request berikutnya
        if (rooms.length > 0) {
          this._lastCursor = rooms[rooms.length - 1].lastTimeMessage; // ambil cursor dari item terakhir
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

  public loadMoreRooms(): void {
    if (this._lastCursor) {
      this.loadRooms(this._lastCursor);
    }
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

  onRoomListScroll(event: any): void {
    const target = event.target;
    const threshold = 200; 
    const position = target.scrollTop + target.clientHeight;
    const height = target.scrollHeight;

    if (height - position <= threshold && !this._isLoadingMore) {
      this._isLoadingMore = true;
      this.loadMoreRooms();
      setTimeout(() => this._isLoadingMore = false, 1000);
    }
  }

  onChatScroll(event: any): void {
    const target = event.target;
    const threshold = 200; 

    if (target.scrollTop <= threshold && !this._isLoadingChatMore && this._modelSelectedRoom?.id) {
      this.loadMoreChats(this._modelSelectedRoom.id);
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

  escapeHtml(text: string): string {
    if (!text) return '';
    return text.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#x60;',
        '=': '&#x3D;',
        '/': '&#x2F;',
      } as Record<string, string>)[s] || s;
    });
  }

  formatMessageAsHtml(msg: string): string {
    if (!msg) return '';
    const escaped = this.escapeHtml(msg);
    return escaped.replace(/\n/g, '<br>');
  }

}