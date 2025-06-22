// src/app/services/chat-core.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, BehaviorSubject, throwError } from 'rxjs';
import { takeUntil, filter, map, catchError } from 'rxjs/operators';
import { WebSocketService } from './user-websocket.service';
import { ChatHistoryService } from './chat-history.service';
import { SessionService } from './session.service';
import { MessageModel } from '../models/message.model';
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
                .pipe(takeUntil(this.destroy$)) 
                .subscribe(
                  data => this.handleRawWebSocketMessage(data),
                  error => console.error('ChatCoreService: WebSocket message stream error:', error),
                  () => console.log('ChatCoreService: WebSocket message stream completed.') 
                );
            })
            .catch(error => {
              console.error('ChatCoreService: WebSocket connection failed:', error);
              
            });
        } else {
          console.error('ChatCoreService: Session ready, but User ID is null.');
          
        }
      });
  }

  sendMessage(text: string): void {
    if (!this._userId) {
      console.error('ChatCoreService: Cannot send message, User ID is not set.');
   
      return;
    }
    
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      console.warn('ChatCoreService: Cannot send empty message.');

      return;
    }

    const payload = {
      type: 'message',
      user_id: this._userId,
      role: ServerRole.User, 
      message: trimmedText, 
    };

    console.log('ChatCoreService: Sending message:', payload);
   
    this.wsService.sendMessage(payload);

    this._isLoadingSending.next(true);

  }

  private handleRawWebSocketMessage(data: any): void {
    console.log('ChatCoreService: Processing raw message:', data);

    let processedMessage: MessageModel | null = null;
    
    let stopLoading = false; 

    if (data.success === true && typeof data.data === 'string' && data.from !== undefined) {
      const content = data.data.trim();
      
      if (content) {
        
        const formattedTime = new Date().toISOString();
        
        let senderType: ENUM_SENDER = ENUM_SENDER.Chatbot; 

        if (data.from === ServerRole.Admin || data.from === ServerRole.Chatbot) {
          senderType = ENUM_SENDER.Chatbot;
        }

        if (data.from !== ServerRole.User) { // Hanya proses pesan dari Bot/Admin
            
          processedMessage = {
              sender: senderType,
              message: content, 
              time: formattedTime,
              
            };
            stopLoading = true; 
        } else {
             console.log('ChatCoreService: Ignoring success message from self (User role).', data);
             
             stopLoading = true; 
        }


      } else {
        console.log('ChatCoreService: Received success message with no content.', data);
        stopLoading = true;
      }

    }
    
    else if (data.type === 'error' && typeof data.error === 'string') {
        console.error('ChatCoreService: Received error message:', data.error);
         processedMessage = {
              sender: ENUM_SENDER.Chatbot,
              message: `Error: ${data.error}`, 
              time: new Date().toISOString(),

          };
          stopLoading = true;
    }
   
    else if (data.type === 'info' && typeof data.message === 'string') {
         console.log('ChatCoreService: Received info message:', data.message);
          processedMessage = {
               sender: ENUM_SENDER.Chatbot, 
               message: `[INFO] ${data.message}`, 
               time: new Date().toISOString(),

           };
           
    }
     
    else if (data.type && ['room_message', 'chat_history', 'active_rooms_update', 'admin_room_joined', 'admin_room_left', 'admin_take_over_status', 'admin_hand_back_status'].includes(data.type)) {
        console.log(`ChatCoreService: Ignoring message type "${data.type}" for user widget.`);
        
    }
    
    else {
        
        if (!(data.success === true && (data.data === undefined || data.from === undefined))) {
             console.warn('ChatCoreService: Received unhandled raw message format:', data);
             
        }
        
    }

    if (processedMessage) {
      this._incomingMessages.next(processedMessage);
    }

    if (stopLoading) {
        this._isLoadingSending.next(false);
    }
  }

  loadHistory(): Observable<MessageModel[]> {
    if (!this._userId) {
      console.error('ChatCoreService: Cannot load history, User ID is not set.');
      
      return throwError(() => new Error("User ID not set for history load"));
    }

    console.log(`ChatCoreService: Loading chat history for user ID: ${this._userId}`);

    return this.historyService.loadChatHistory(this._userId).pipe(
     
      map((response: UserHistoryResponseModel) => {
        console.log('ChatCoreService: Mapping history data:', response);

        if (!response || !response.history || response.history.length === 0) {
            console.log('ChatCoreService: No history data received.');
            return [];
        }

        const chats = response.history; 

        chats.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeA - timeB;
        });

        const historyMessages: MessageModel[] = chats
            .map(chat => { 

              const formattedTime = chat.created_at?.slice(0, 16).replace('T', ' ') ?? '';
              
              let senderType: ENUM_SENDER;

              if (chat.role === ServerRole.User) {
                  senderType = ENUM_SENDER.User;
              } else if (chat.role === ServerRole.Admin || chat.role === ServerRole.Chatbot) {
                  
                  senderType = ENUM_SENDER.Chatbot; 
              } else {
                 console.warn(`ChatCoreService: Unhandled role in history: ${chat.role}. Defaulting to Chatbot.`);
                 senderType = ENUM_SENDER.Chatbot;
              }

              const message: MessageModel = {
                  sender: senderType,
                  message: chat.message || '', 
                  time: formattedTime,
              };

              return message;
            })
            .filter(msg => msg.message); 

        console.log('ChatCoreService: Mapped history messages:', historyMessages);
        return historyMessages; 
      }),
      catchError(err => {
         
        console.error('ChatCoreService: Failed to load or map history:', err);
         
        return throwError(() => new Error('Failed to load chat history'));
      })
    );
  }

  ngOnDestroy(): void {
    console.log('ChatCoreService destroyed. Disconnecting WebSocket.');
    
    this.destroy$.next();
    
    this.destroy$.complete();
    
    this.wsService.disconnect(); 
    
    this._incomingMessages.complete();
    
    this._isLoadingSending.complete();
  }
}