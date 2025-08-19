// // src/app/components/playground/playground.component.ts
// import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { SessionService } from '../services/session.service';
// import { Subject, Observable } from 'rxjs'; 
// import { takeUntil, filter, finalize, catchError } from 'rxjs/operators';
// import { ENUM_SENDER } from '../constants/enum.constant';
// import { MessageModel } from '../models/message.model';
// import { ChatCoreService } from '../services/user-chat-core.service';
// import { BreadcrumbModule } from 'primeng/breadcrumb';
// import { MenuItem } from 'primeng/api';
// import { ButtonModule } from 'primeng/button';
// import { AvatarModule } from 'primeng/avatar'; 
// import { TextareaModule } from 'primeng/textarea'; 
// import { IconFieldModule } from 'primeng/iconfield'; 
// import { InputIconModule } from 'primeng/inputicon'; 

// @Component({
//   selector: 'app-playground',
//   standalone: true,
//   imports: [
//     CommonModule,
//     HttpClientModule,
//     FormsModule,
//     ButtonModule,
//     BreadcrumbModule,
//     AvatarModule, 
//     TextareaModule, 
//     IconFieldModule, 
//     InputIconModule 
//   ],
//   templateUrl: './playground.component.html',
//   styleUrls: ['./playground.component.scss'],
// })
// export class PlaygroundComponent implements OnInit, OnDestroy {
//   @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('chatScroll') chatScroll!: ElementRef;

//   public _objChatMessages: Record<string, MessageModel[]> = {};
//   public _arrayModelFilteredMessage: MessageModel[] = [];
//   public _listMenuItems: MenuItem[] | undefined;
//   public _defaultHomeMenu: MenuItem | undefined;
//   public _enumSender = ENUM_SENDER;
//   private _stringUserId: string | null = null;

//   public isLoadingHistory: boolean = false;

//   private destroy$ = new Subject<void>();

//   constructor(
//     private sessionService: SessionService,
//     private cdr: ChangeDetectorRef,
//     private ngZone: NgZone,
//     public chatCoreService: ChatCoreService
//   ) {
//     this._objChatMessages = {};
//     this._arrayModelFilteredMessage = [];
//   }

//   ngOnInit(): void {
//     console.log('PlaygroundComponent initializing...');

//     this._listMenuItems = [
//       { label: 'Playground' }
//     ];
//     this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };

//     this.sessionService.initializationStatus$
//       .pipe(
//         filter(isInitialized => isInitialized === true),
//         takeUntil(this.destroy$)
//       )
//       .subscribe(() => {
//         console.log('Playground: Session initialization complete. Getting User ID.');
        
//         this._stringUserId = this.sessionService.getUserId();

//         if (this._stringUserId) {
//           console.log(`Playground: User ID obtained: ${this._stringUserId}. Setting up chat.`);
          
//           this.subscribeToIncomingMessages();
          
//           this.loadInitialHistory();
          
//           this.subscribeToConnectionStatus();
        
//         } else {
//           console.error('Playground: User ID is null after session initialization. Cannot setup playground.');
//         }
//       });
//   }

//   private subscribeToIncomingMessages(): void {
//     this.chatCoreService.incomingMessages$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(message => {
//         this.ngZone.run(() => {
//           console.log('Playground received processed message from ChatCoreService:', message);

//           const messageKey = this._stringUserId;
          
//           if (messageKey) {
//             if (!this._objChatMessages[messageKey]) {
//               this._objChatMessages[messageKey] = [];
//             }

//             const isDuplicate = this._objChatMessages[messageKey].some(
//                 m => m.message === message.message && m.time === message.time && m.sender === message.sender
//             );
//             if (!isDuplicate) {
//                 this._objChatMessages[messageKey].push(message);
//             }

//             this.updateFilteredMessages();
            
//             this.cdr.detectChanges();
            
//             this.scrollToBottom();
          
//           } else {
//             console.warn("Playground: User ID null, tidak dapat menambahkan pesan masuk.");
//           }
//         });
//       });
//   }

//   private loadInitialHistory(): void {
//     if (!this._stringUserId) {
//       console.warn("Playground: User ID null, tidak dapat memuat riwayat.");
//       return;
//     }

//     this.isLoadingHistory = true;
    
//     this.cdr.detectChanges();

//     this.chatCoreService.loadHistory()
//       .pipe(
//         takeUntil(this.destroy$),

//         finalize(() => {
//           this.ngZone.run(() => {
            
//             this.isLoadingHistory = false;
            
//             this.cdr.detectChanges();

//           });
//         }),
//         catchError(err => {
//           console.error('Playground: Error saat memuat riwayat:', err);
//           return [];
//         })
//       )
//       .subscribe({
//         next: historyMessages => {
//           this.ngZone.run(() => {
//             console.log('Playground menerima riwayat:', historyMessages);
//             if (this._stringUserId) {
              
//               this._objChatMessages[this._stringUserId] = historyMessages;
             
//               this.updateFilteredMessages();
              
//               this.cdr.detectChanges();
              
//               this.scrollToBottom();
//             }
//           });
//         },
//         error: err => {
//           console.error('Playground: Gagal memuat riwayat (callback error):', err.message || err);
//         }
//       });
//   }

//   private subscribeToConnectionStatus(): void {
//     if (this.chatCoreService.wsConnectionStatus$) {
//       this.chatCoreService.wsConnectionStatus$
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(status => {
//           this.ngZone.run(() => {
//             console.log('Playground: Status Koneksi WS ->', status);
//             this.cdr.detectChanges();
//           });
//         });
//     }
//   }

//   ngOnDestroy(): void {
//     console.log('PlaygroundComponent is being destroyed.');
    
//     this.destroy$.next();
    
//     this.destroy$.complete();
//   }

//   updateFilteredMessages(): void {
    
//     const key = this._stringUserId ?? '';
    
//     this._arrayModelFilteredMessage = this._objChatMessages[key]?.filter(msg => msg.message) || [];
//   }

//   sendMessage(): void {
    
//     const userMessage = this.userInput.nativeElement.value.trim();
    
//     console.log('Playground: Mengirim pesan ->', userMessage);
    
//     console.log('Playground: User ID ->', this._stringUserId);

//     if (!userMessage || !this._stringUserId) {
//       console.warn("Tidak dapat mengirim pesan: teks kosong atau User ID tidak ada.");
//       return;
//     }

//     const time = new Date().toISOString();

//     const optimisticMessage: MessageModel = {
//       sender: this._enumSender.User,
//       message: userMessage,
//       time: time,
//     };

//     const messageKey = this._stringUserId; // Selalu gunakan user ID
//     if (messageKey) {
//       if (!this._objChatMessages[messageKey]) {
//         this._objChatMessages[messageKey] = [];
//       }
      
//       this._objChatMessages[messageKey].push(optimisticMessage);
      
//       this.updateFilteredMessages();
      
//       this.cdr.detectChanges();
      
//       this.scrollToBottom();
//     }

//     this.chatCoreService.sendMessage(userMessage);
    
//     this.userInput.nativeElement.value = '';
//   }

//   scrollToBottom(): void {
//     if (!this.chatScroll || !this.chatScroll.nativeElement) {
//       return;
//     }
//     this.ngZone.runOutsideAngular(() => {
//       setTimeout(() => {
//         const el = this.chatScroll.nativeElement;
//         el.scrollTop = el.scrollHeight;
//         this.ngZone.run(() => this.cdr.detectChanges());
//       }, 0);
//     });
//   }

//   escapeHtml(text: string): string {
//     if (!text) return '';
//     return text.replace(/[&<>"'`=\/]/g, function (s) {
//       return ({
//         '&': '&amp;',
//         '<': '&lt;',
//         '>': '&gt;',
//         '"': '&quot;',
//         "'": '&#39;',
//         '`': '&#x60;',
//         '=': '&#x3D;',
//         '/': '&#x2F;',
//       } as Record<string, string>)[s] || s;
//     });
//   }

//   formatMessageAsHtml(msg: string): string {
//     if (!msg) return '';
//     const escaped = this.escapeHtml(msg);
//     return escaped.replace(/\n/g, '<br>');
//   }
// }