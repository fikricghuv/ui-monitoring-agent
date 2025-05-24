// src/app/components/chat-widget/chat-widget.component.ts
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SessionService } from '../services/session.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ENUM_SENDER } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model';

// --- Import ChatCoreService yang baru ---
import { ChatCoreService } from '../services/user-chat-core.service';
// ----------------------------------------

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // HttpClientModule jika services yang diimpor menggunakannya
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  // Properti untuk kontrol visibilitas chat modal dan badge
  public _booleanIsOpen: boolean = false; // Mengontrol apakah modal chat terbuka
  public _booleanShowNotificationBubble: boolean = false; // Mengontrol visibilitas badge
  public _numberUnreadMessageCount: number = 0; // Jumlah pesan belum dibaca

  private _stringUserId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private chatCoreService: ChatCoreService // Injeksi ChatCoreService
  ) {}

  ngOnInit(): void {
    console.log('ChatWidgetComponent initializing...');

    this.sessionService.initializationStatus$
      .pipe(
        filter(isInitialized => isInitialized === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('ChatWidget: Session initialization complete. Getting User ID.');
        this._stringUserId = this.sessionService.getUserId();

        if (this._stringUserId) {
          console.log(`ChatWidget: User ID obtained: ${this._stringUserId}.`);
          this.subscribeToIncomingMessages(); // Langganan pesan untuk badge
        } else {
          console.error('ChatWidget: User ID is null after session initialization. Cannot setup widget.');
        }
      });
  }

  ngAfterViewInit(): void {
      // Tidak ada ViewChild di sini karena iframe mengelola kontennya sendiri
      // Anda mungkin ingin mengirim pesan ke iframe setelah iframe dimuat sepenuhnya
      // Namun, ini lebih kompleks dan di luar scope respons ini.
  }

  private subscribeToIncomingMessages(): void {
    // Langganan pesan dari ChatCoreService untuk mengelola badge
    this.chatCoreService.incomingMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        // Hanya tambahkan badge jika pesan berasal dari chatbot dan chat modal tidak terbuka
        if (message.sender === ENUM_SENDER.Chatbot && !this._booleanIsOpen) {
          this._numberUnreadMessageCount++;
          this._booleanShowNotificationBubble = true;
          this.cdr.detectChanges(); // Perbarui UI
          console.log(`ChatWidget: New unread message. Count: ${this._numberUnreadMessageCount}`);
        }
      });
  }

  ngOnDestroy(): void {
    console.log('ChatWidgetComponent is being destroyed.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Metode untuk membuka/menutup chat modal
  toggleChat(): void {
    this._booleanIsOpen = !this._booleanIsOpen;
    console.log(`Chat modal is now: ${this._booleanIsOpen ? 'Open' : 'Closed'}`);

    if (this._booleanIsOpen) {
      // Saat chat dibuka, reset badge notifikasi
      this._numberUnreadMessageCount = 0;
      this._booleanShowNotificationBubble = false;
      // Opsional: Kirim pesan ke iframe untuk scroll ke bawah
      // Ini membutuhkan PostMessage API, yang di luar scope respons ini.
      // Anda harus menambahkan fungsionalitas di `playground.component` untuk merespons pesan ini.
    }
    this.cdr.detectChanges();
  }

  // Anda tidak memerlukan metode closeChat() terpisah jika toggleChat() sudah mencukupi
}