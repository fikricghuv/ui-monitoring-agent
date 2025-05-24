import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromptService } from '../services/prompt.service';
import { Prompt } from '../models/prompt.model';

// Impor modul PrimeNG yang akan digunakan
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api'; // Untuk Toast atau pesan lainnya
import { ToastModule } from 'primeng/toast'; // Untuk menampilkan notifikasi
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,          // <--- Tambahkan CardModule
    ListboxModule,       // <--- Tambahkan ListboxModule
    TextareaModule, // <--- Tambahkan InputTextareaModule
    ButtonModule,        // <--- Tambahkan ButtonModule
    ToastModule,          // <--- Tambahkan ToastModule
    BreadcrumbModule
  ],
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['./prompt-editor.component.scss'],
  providers: [MessageService] // <--- Tambahkan MessageService ke providers
})
export class PromptEditorComponent implements OnInit {
  public _arrayPrompts: Array<Prompt>;
  public _objtSelectedPrompt: Prompt;
  public _stringOriginalContent: string; // Ubah ke string
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;

  constructor(
    private _servicePrompt: PromptService,
    private messageService: MessageService // <--- Injeksi MessageService
  ) {
    this._arrayPrompts = [];
    this._objtSelectedPrompt = { name: '', content: '' };
    this._stringOriginalContent = ''; // Inisialisasi sebagai string kosong
  }

  ngOnInit() {
    this.loadPrompts();
    this.items = [
            { label: 'Prompt Editor' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  // Memuat daftar prompt
  public loadPrompts() {
    this._servicePrompt.loadPrompts().subscribe({
      next: (data) => {
        this._arrayPrompts = data;
        console.log("Memuat daftar prompt: ", data);
        // Jika ada prompt, pilih yang pertama secara default
        if (this._arrayPrompts.length > 0) {
          this._objtSelectedPrompt = { ...this._arrayPrompts[0] };
          this._stringOriginalContent = this._objtSelectedPrompt.content || '';
        }
      },
      error: (error) => {
        console.error('Error loading _arrayPrompts:', error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to load prompts.'});
      }
    });
  }

  // Metode untuk menangani pemilihan prompt dari p-listbox
  public onPromptSelect(event: any) {
    // event.value adalah objek prompt yang dipilih
    this._objtSelectedPrompt = { ...event.value }; // Buat salinan untuk menghindari modifikasi langsung
    this._stringOriginalContent = this._objtSelectedPrompt.content || ''; // Simpan konten asli
  }

  // Menyimpan prompt
  public savePrompt() {
    this._servicePrompt.savePrompt(this._objtSelectedPrompt.name || '', this._objtSelectedPrompt.content || '')
      .subscribe({
        next: (response) => {
          console.log('Prompt updated successfully!', response);
          this.loadPrompts(); // Muat ulang daftar prompt setelah berhasil menyimpan
          // Setelah disimpan, konten saat ini menjadi konten asli yang baru
          this._stringOriginalContent = this._objtSelectedPrompt.content || '';
          this.messageService.add({severity:'success', summary:'Success', detail:'Prompt updated successfully!'});
        },
        error: (error) => {
          console.error('Error updating prompt:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Failed to update prompt.'});
        }
      });
  }

  // Reset prompt ke nilai asli
  public resetPrompt() {
    this._objtSelectedPrompt.content = this._stringOriginalContent;
    this.messageService.add({severity:'info', summary:'Info', detail:'Prompt content reset.'});
  }

  // Mengecek apakah ada perubahan pada prompt
  public isPromptChanged(): boolean {
    return this._objtSelectedPrompt.content !== this._stringOriginalContent;
  }
}