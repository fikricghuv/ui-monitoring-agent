// src/app/components/playground/playground.component.ts
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Diperlukan jika layanan diimpor yang menggunakannya
import { SessionService } from '../services/session.service'; // Perbaikan path: services
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter, finalize, catchError } from 'rxjs/operators';
import { ENUM_SENDER } from '../constants/enum.constant';
import { MessageModel } from '../models/message.model'; // Perbaikan path: models
import { RoomConversationModel } from '../models/room.model'; // Perbaikan path: models

import { ChatCoreService } from '../services/user-chat-core.service'; // Perbaikan path: services
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, 
    ButtonModule, BreadcrumbModule, CardModule],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  public _objChatMessages: Record<string, MessageModel[]> = {}; // Mengelola pesan untuk beberapa 'room' (jika ada)
  public _modelSelectedRoom: RoomConversationModel | null = null; // Digunakan jika ada fitur memilih 'room'
  public _arrayModelFilteredMessage: MessageModel[] = []; // Pesan yang ditampilkan di UI
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;
  public _enumSender = ENUM_SENDER;
  private _stringUserId: string | null = null;

  public isLoadingHistory: boolean = false; // Status loading untuk riwayat chat

  private destroy$ = new Subject<void>(); // Untuk unsubscribe Observable saat komponen dihancurkan

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    public chatCoreService: ChatCoreService // Dibuat 'public' agar bisa diakses langsung di template
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
        filter(isInitialized => isInitialized === true), // Tunggu SessionService menginisialisasi userId
        takeUntil(this.destroy$) // Berhenti langganan saat komponen dihancurkan
      )
      .subscribe(() => {
        console.log('Playground: Session initialization complete. Getting User ID.');
        this._stringUserId = this.sessionService.getUserId();

        if (this._stringUserId) {
          console.log(`Playground: User ID obtained: ${this._stringUserId}. Setting up chat.`);

          // ChatCoreService sudah menangani koneksi WebSocket dan subskripsi internalnya
          // secara otomatis setelah userId tersedia.
          this.subscribeToIncomingMessages(); // Langganan pesan yang sudah diproses dari ChatCoreService
          this.loadInitialHistory(); // Muat riwayat chat awal
          this.subscribeToConnectionStatus(); // Opsional: pantau status koneksi WebSocket
        } else {
          console.error('Playground: User ID is null after session initialization. Cannot setup playground.');
        }
      });
  }

  /**
   * Berlangganan pesan masuk yang sudah diproses dari ChatCoreService.
   */
  private subscribeToIncomingMessages(): void {
    this.chatCoreService.incomingMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.ngZone.run(() => { // Pastikan update UI berjalan dalam Angular zone
          console.log('Playground received processed message from ChatCoreService:', message);

          const messageKey = this._modelSelectedRoom?.name ?? this._stringUserId;
          if (messageKey) {
            if (!this._objChatMessages[messageKey]) {
              this._objChatMessages[messageKey] = [];
            }

            // Logika untuk menambahkan/memperbarui pesan.
            // Asumsi: ChatCoreService sudah memproses pesan dari server dengan baik.
            // Jika Anda mengimplementasikan ID unik dari server, gunakan itu untuk deduplikasi.
            // Untuk saat ini, kita akan coba update pesan optimis (yang tidak punya ID server)
            // ketika pesan balasan dari server datang.

            let messageUpdated = false;
            // Coba update pesan user yang sifatnya 'optimis' (belum ada ID server)
            if (message.sender === ENUM_SENDER.User /* && message.id && message.id.startsWith('server-') */) {
                // Jika server mengirim kembali pesan user dengan ID server, cari pesan optimis yang cocok dan update
                // Catatan: Jika pesan dari server juga tidak memiliki ID unik untuk dicocokkan,
                // maka perlu logika pencocokan yang lebih kompleks (misal berdasarkan waktu dan konten).
                // Untuk contoh ini, saya akan mencoba mencocokkan pesan user yang *mungkin* merupakan balasan optimis.
                const optimisticIndex = this._objChatMessages[messageKey].findIndex(
                    m => m.sender === ENUM_SENDER.User && !m.room_id && m.message === message.message
                );
                if (optimisticIndex > -1) {
                    // Update pesan optimis dengan data server yang lebih akurat
                    this._objChatMessages[messageKey][optimisticIndex] = { ...this._objChatMessages[messageKey][optimisticIndex], ...message };
                    messageUpdated = true;
                }
            }

            // Jika pesan bukan update (misal: pesan bot/admin baru, atau pesan user optimis pertama kali)
            if (!messageUpdated) {
                // Untuk menghindari duplikasi dari pesan bot/admin yang dikirim ulang oleh server (jarang)
                const isDuplicate = this._objChatMessages[messageKey].some(
                    m => m.message === message.message && m.time === message.time && m.sender === message.sender
                );
                if (!isDuplicate) {
                    this._objChatMessages[messageKey].push(message);
                }
            }

            this.updateFilteredMessages();
            this.cdr.detectChanges(); // Pemicu deteksi perubahan untuk memperbarui UI
            this.scrollToBottom();
          } else {
            console.warn("Playground: User ID atau selected room null, tidak dapat menambahkan pesan masuk.");
          }
        });
      });
  }

  /**
   * Memuat riwayat chat awal untuk userId yang sedang aktif.
   */
  private loadInitialHistory(): void {
    if (!this._stringUserId) {
      console.warn("Playground: User ID null, tidak dapat memuat riwayat.");
      return;
    }

    this.isLoadingHistory = true; // Aktifkan indikator loading
    this.cdr.detectChanges(); // Perbarui UI untuk menampilkan loader

    this.chatCoreService.loadHistory()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { // Pastikan isLoadingHistory diset false baik sukses maupun error
          this.ngZone.run(() => {
            this.isLoadingHistory = false;
            this.cdr.detectChanges();
          });
        }),
        catchError(err => {
          console.error('Playground: Error saat memuat riwayat:', err);
          // Anda bisa menampilkan pesan error yang ramah pengguna di sini
          return []; // Kembalikan array kosong agar stream tidak berhenti
        })
      )
      .subscribe({
        next: historyMessages => {
          this.ngZone.run(() => {
            console.log('Playground menerima riwayat:', historyMessages);
            if (this._stringUserId) {
              // Kunci untuk riwayat adalah user ID saat ini
              this._objChatMessages[this._stringUserId] = historyMessages;
              this.updateFilteredMessages();
              this.cdr.detectChanges();
              this.scrollToBottom();
            }
          });
        },
        error: err => {
          // Error sudah di-handle oleh catchError di pipe, di sini bisa untuk logging tambahan atau notifikasi UI
          console.error('Playground: Gagal memuat riwayat (callback error):', err.message || err);
        }
      });
  }

  /**
   * Berlangganan status koneksi WebSocket dari ChatCoreService.
   */
  private subscribeToConnectionStatus(): void {
    if (this.chatCoreService.wsConnectionStatus$) {
      this.chatCoreService.wsConnectionStatus$
        .pipe(takeUntil(this.destroy$))
        .subscribe(status => {
          this.ngZone.run(() => {
            console.log('Playground: Status Koneksi WS ->', status);
            // Anda bisa menyimpan status ini ke properti komponen jika ingin menampilkannya di template (misal: "Connecting...", "Connected", "Disconnected")
            this.cdr.detectChanges();
          });
        });
    }
  }

  ngOnDestroy(): void {
    console.log('PlaygroundComponent is being destroyed.');
    this.destroy$.next(); // Memicu `takeUntil` untuk menghentikan semua langganan
    this.destroy$.complete(); // Menyelesaikan Subject
    // ChatCoreService adalah 'providedIn: root', jadi lifecycle-nya akan diurus oleh Angular,
    // termasuk pemutusan WebSocket saat aplikasi ditutup.
  }

  /**
   * (Opsional) Digunakan jika ada fitur untuk memilih user/room.
   */
  selectUser(room: RoomConversationModel): void {
    console.log('Playground: Memilih room/user ->', room);
    this._modelSelectedRoom = room;
    const key = room.name; // Asumsi room.name adalah kunci yang valid
    if (key) {
        if (!this._objChatMessages[key]) {
            this._objChatMessages[key] = [];
            // TODO: Mungkin perlu memuat riwayat spesifik untuk room/user ini jika belum ada
            // this.loadHistoryForSelectedRoom(key);
        }
        this.updateFilteredMessages();
        this.scrollToBottom();
    }
  }

  /**
   * Memperbarui array pesan yang akan ditampilkan berdasarkan room yang dipilih atau userId.
   */
  updateFilteredMessages(): void {
    const key = this._modelSelectedRoom?.name ?? this._stringUserId ?? '';
    // Pastikan hanya pesan dengan konten (tidak kosong) yang ditampilkan
    this._arrayModelFilteredMessage = this._objChatMessages[key]?.filter(msg => msg.message) || [];
    // console.log('Pesan filter diperbarui untuk kunci:', key, this._arrayModelFilteredMessage);
  }

  /**
   * Mengirim pesan user.
   */
  sendMessage(): void {
    // Ambil pesan dari input. Gunakan `currentMessageText` jika pakai [(ngModel)].
    // Jika tidak pakai `ngModel`, gunakan `this.userInput.nativeElement.value`.
    const userMessage = this.userInput.nativeElement.value.trim();
    console.log('Playground: Mengirim pesan ->', userMessage);
    console.log('Playground: User ID ->', this._stringUserId);

    if (!userMessage || !this._stringUserId) {
      console.warn("Tidak dapat mengirim pesan: teks kosong atau User ID tidak ada.");
      return;
    }

    // --- Optimistic UI Update ---
    // Tambahkan pesan user ke UI secara optimis (sebelum server merespons).
    const time = new Date().toISOString();
    const optimisticMessage: MessageModel = {
      sender: this._enumSender.User,
      message: userMessage,
      time: time,
      // id: `temp-${Date.now()}` // Opsional: Tambahkan ID sementara untuk pencocokan lebih baik nanti
    };

    const messageKey = this._modelSelectedRoom?.name ?? this._stringUserId;
    if (messageKey) {
      if (!this._objChatMessages[messageKey]) {
        this._objChatMessages[messageKey] = [];
      }
      this._objChatMessages[messageKey].push(optimisticMessage);
      this.updateFilteredMessages();
      this.cdr.detectChanges(); // Perbarui tampilan
      this.scrollToBottom();
    }

    // Kirim pesan melalui ChatCoreService
    this.chatCoreService.sendMessage(userMessage);

    // Kosongkan input setelah mengirim
    this.userInput.nativeElement.value = '';
  }

  /**
   * Menggulir tampilan chat ke bagian paling bawah.
   */
  scrollToBottom(): void {
    if (!this.chatScroll || !this.chatScroll.nativeElement) {
      // console.warn("⚠️ chatScroll belum tersedia saat scrollToBottom dipanggil.");
      return;
    }
    // Menjalankan di luar Angular Zone untuk optimasi performa DOM.
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const el = this.chatScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
        // Kembali ke Angular Zone untuk memicu deteksi perubahan jika diperlukan
        this.ngZone.run(() => this.cdr.detectChanges());
      }, 0);
    });
  }
}