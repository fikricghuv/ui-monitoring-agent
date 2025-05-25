// src/app/components/playground/playground.component.ts
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SessionService } from '../services/session.service';
import { Subject, Observable } from 'rxjs'; // Observable mungkin tidak perlu diimpor eksplisit jika hanya digunakan di pipe
import { takeUntil, filter, finalize, catchError } from 'rxjs/operators';
import { ENUM_SENDER } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model';
// import { RoomConversationModel } from '../models/room.model'; // Tidak digunakan, bisa dihapus

import { ChatCoreService } from '../services/user-chat-core.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
// import { CardModule } from 'primeng/card'; // Tidak lagi digunakan secara langsung
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar'; // Tambahkan
import { TextareaModule } from 'primeng/textarea'; // Tambahkan
import { IconFieldModule } from 'primeng/iconfield'; // Tambahkan untuk search bar jika ditambahkan lagi
import { InputIconModule } from 'primeng/inputicon'; // Tambahkan untuk search bar jika ditambahkan lagi

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ButtonModule,
    BreadcrumbModule,
    // CardModule, // Hapus
    AvatarModule, // Tambahkan
    TextareaModule, // Tambahkan
    IconFieldModule, // Jika ingin ada search bar, tambahkan
    InputIconModule // Jika ingin ada search bar, tambahkan
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  // Anda bisa menyederhanakan _objChatMessages jika Anda hanya berinteraksi dengan satu 'room' (yaitu pengguna saat ini)
  public _objChatMessages: Record<string, MessageModel[]> = {};
  // public _modelSelectedRoom: RoomConversationModel | null = null; // Tidak digunakan, bisa dihapus
  public _arrayModelFilteredMessage: MessageModel[] = [];
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;
  public _enumSender = ENUM_SENDER;
  private _stringUserId: string | null = null;

  public isLoadingHistory: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    public chatCoreService: ChatCoreService
  ) {
    this._objChatMessages = {};
    this._arrayModelFilteredMessage = [];
  }

  ngOnInit(): void {
    console.log('PlaygroundComponent initializing...');

    this.items = [
      { label: 'Prompt Editor' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    this.sessionService.initializationStatus$
      .pipe(
        filter(isInitialized => isInitialized === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Playground: Session initialization complete. Getting User ID.');
        this._stringUserId = this.sessionService.getUserId();

        if (this._stringUserId) {
          console.log(`Playground: User ID obtained: ${this._stringUserId}. Setting up chat.`);
          this.subscribeToIncomingMessages();
          this.loadInitialHistory();
          this.subscribeToConnectionStatus();
        } else {
          console.error('Playground: User ID is null after session initialization. Cannot setup playground.');
        }
      });
  }

  private subscribeToIncomingMessages(): void {
    this.chatCoreService.incomingMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.ngZone.run(() => {
          console.log('Playground received processed message from ChatCoreService:', message);

          // Kunci pesan selalu berdasarkan user ID saat ini karena hanya ada satu 'conversation'
          const messageKey = this._stringUserId;
          if (messageKey) {
            if (!this._objChatMessages[messageKey]) {
              this._objChatMessages[messageKey] = [];
            }

            // Logika untuk menambahkan/memperbarui pesan
            let messageUpdated = false;
            // Jika Anda memiliki ID unik dari server, gunakan itu untuk deduplikasi.
            // Untuk playground, mungkin tidak ada kebutuhan kompleks seperti ini.
            // Cukup tambahkan pesan baru.
            const isDuplicate = this._objChatMessages[messageKey].some(
                m => m.message === message.message && m.time === message.time && m.sender === message.sender
            );
            if (!isDuplicate) {
                this._objChatMessages[messageKey].push(message);
            }
            // else {
            //     // Opsional: Jika Anda ingin mengganti pesan optimis dengan yang dari server
            //     const optimisticIndex = this._objChatMessages[messageKey].findIndex(
            //         m => m.message === message.message && m.sender === ENUM_SENDER.User && !m.id // Asumsi pesan optimis tidak punya ID server
            //     );
            //     if (optimisticIndex > -1) {
            //         this._objChatMessages[messageKey][optimisticIndex] = message;
            //     }
            // }


            this.updateFilteredMessages();
            this.cdr.detectChanges();
            this.scrollToBottom();
          } else {
            console.warn("Playground: User ID null, tidak dapat menambahkan pesan masuk.");
          }
        });
      });
  }

  private loadInitialHistory(): void {
    if (!this._stringUserId) {
      console.warn("Playground: User ID null, tidak dapat memuat riwayat.");
      return;
    }

    this.isLoadingHistory = true;
    this.cdr.detectChanges();

    this.chatCoreService.loadHistory()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingHistory = false;
            this.cdr.detectChanges();
          });
        }),
        catchError(err => {
          console.error('Playground: Error saat memuat riwayat:', err);
          return [];
        })
      )
      .subscribe({
        next: historyMessages => {
          this.ngZone.run(() => {
            console.log('Playground menerima riwayat:', historyMessages);
            if (this._stringUserId) {
              this._objChatMessages[this._stringUserId] = historyMessages;
              this.updateFilteredMessages();
              this.cdr.detectChanges();
              this.scrollToBottom();
            }
          });
        },
        error: err => {
          console.error('Playground: Gagal memuat riwayat (callback error):', err.message || err);
        }
      });
  }

  private subscribeToConnectionStatus(): void {
    if (this.chatCoreService.wsConnectionStatus$) {
      this.chatCoreService.wsConnectionStatus$
        .pipe(takeUntil(this.destroy$))
        .subscribe(status => {
          this.ngZone.run(() => {
            console.log('Playground: Status Koneksi WS ->', status);
            this.cdr.detectChanges();
          });
        });
    }
  }

  ngOnDestroy(): void {
    console.log('PlaygroundComponent is being destroyed.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Fungsi selectUser() tidak lagi diperlukan karena tidak ada daftar user
  // selectUser(room: RoomConversationModel): void {
  //   console.log('Playground: Memilih room/user ->', room);
  //   this._modelSelectedRoom = room;
  //   const key = room.name;
  //   if (key) {
  //       if (!this._objChatMessages[key]) {
  //           this._objChatMessages[key] = [];
  //       }
  //       this.updateFilteredMessages();
  //       this.scrollToBottom();
  //   }
  // }

  updateFilteredMessages(): void {
    // Selalu gunakan _stringUserId sebagai kunci karena ini adalah playground 1-ke-1
    const key = this._stringUserId ?? '';
    this._arrayModelFilteredMessage = this._objChatMessages[key]?.filter(msg => msg.message) || [];
  }

  sendMessage(): void {
    const userMessage = this.userInput.nativeElement.value.trim();
    console.log('Playground: Mengirim pesan ->', userMessage);
    console.log('Playground: User ID ->', this._stringUserId);

    if (!userMessage || !this._stringUserId) {
      console.warn("Tidak dapat mengirim pesan: teks kosong atau User ID tidak ada.");
      return;
    }

    // --- Optimistic UI Update ---
    const time = new Date().toISOString();
    const optimisticMessage: MessageModel = {
      sender: this._enumSender.User, // Pengirim adalah user
      message: userMessage,
      time: time,
    };

    const messageKey = this._stringUserId; // Selalu gunakan user ID
    if (messageKey) {
      if (!this._objChatMessages[messageKey]) {
        this._objChatMessages[messageKey] = [];
      }
      this._objChatMessages[messageKey].push(optimisticMessage);
      this.updateFilteredMessages();
      this.cdr.detectChanges();
      this.scrollToBottom();
    }

    this.chatCoreService.sendMessage(userMessage);
    this.userInput.nativeElement.value = '';
  }

  scrollToBottom(): void {
    if (!this.chatScroll || !this.chatScroll.nativeElement) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const el = this.chatScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
        this.ngZone.run(() => this.cdr.detectChanges());
      }, 0);
    });
  }
}