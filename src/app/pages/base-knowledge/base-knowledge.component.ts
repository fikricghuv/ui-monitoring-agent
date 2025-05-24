import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { FileInfoModel } from '../models/file_info.model';
import { KnowledgeBaseConfigModel } from '../models/knowledge_base_config.model';

// Impor modul PrimeNG yang akan digunakan
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUploadEvent } from 'primeng/fileupload'; // Impor FileUploadSelectEvent
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api'; // Untuk Toast atau pesan lainnya
import { ToastModule } from 'primeng/toast'; // Untuk menampilkan notifikasi
import { TooltipModule } from 'primeng/tooltip'; // Untuk tooltip pada tombol hapus
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-base-knowledge',
  standalone: true, // Pastikan ini true
  imports: [
    CommonModule,
    FormsModule,
    CardModule,          // <--- Tambahkan CardModule
    FieldsetModule,      // <--- Tambahkan FieldsetModule
    InputNumberModule,   // <--- Tambahkan InputNumberModule
    ButtonModule,        // <--- Tambahkan ButtonModule
    FileUploadModule,    // <--- Tambahkan FileUploadModule
    ListboxModule,       // <--- Tambahkan ListboxModule
    ProgressSpinnerModule, // <--- Tambahkan ProgressSpinnerModule
    ToastModule,         // <--- Tambahkan ToastModule
    TooltipModule,     
    BreadcrumbModule
  ],
  templateUrl: './base-knowledge.component.html',
  styleUrl: './base-knowledge.component.scss',
  providers: [MessageService] // <--- Tambahkan MessageService ke providers
})
export class BaseKnowledgeComponent implements OnInit {
  public _fileSelectedFile: File | null;
  public _arrayUploadedFiles: Array<FileInfoModel>;
  public _booleanIsLoading: boolean;
  public _arrayKnowledgeBaseConfig: KnowledgeBaseConfigModel;
  public _arrayOriginalConfig: KnowledgeBaseConfigModel; // Menggunakan nama yang lebih jelas
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;

  constructor(
    private knowledgeBaseService: KnowledgeBaseService,
    private messageService: MessageService // <--- Injeksi MessageService
  ) {
    this._fileSelectedFile = null;
    this._arrayUploadedFiles = [];
    this._booleanIsLoading = false;
    this._arrayKnowledgeBaseConfig = { chunk_size: 0, overlap: 0, num_documents: 0 };
    this._arrayOriginalConfig = { chunk_size: 0, overlap: 0, num_documents: 0 };
  }

  ngOnInit() {
    this.fetchUploadedFiles();
    this.loadKnowledgeBaseConfig();
    this.items = [
            { label: 'Knowledge Base' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  public loadKnowledgeBaseConfig() {
    this.knowledgeBaseService.getKnowledgeBaseConfig().subscribe({
      next: (data) => {
        if (!data) { // Cek apakah data kosong atau null
          console.error('Invalid response format: data is null or undefined');
          this.messageService.add({severity:'error', summary:'Error', detail:'Failed to load knowledge base config: Invalid data received.'});
          return;
        }
        this._arrayKnowledgeBaseConfig = {
          chunk_size: data.chunk_size ?? 0,
          overlap: data.overlap ?? 0,
          num_documents: data.num_documents ?? 0
        };
        this._arrayOriginalConfig = { ...this._arrayKnowledgeBaseConfig }; // Salin objek
      },
      error: (error) => {
        console.error('Failed to load knowledge base config:', error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to load knowledge base configuration!'});
      }
    });
  }

  public updateKnowledgeBaseConfig() {
    this._booleanIsLoading = true; // Set loading saat mulai update
    this.knowledgeBaseService.updateKnowledgeBaseConfig(this._arrayKnowledgeBaseConfig).subscribe({
      next: () => {
        this.messageService.add({severity:'success', summary:'Success', detail:'Knowledge Base Config updated successfully!'});
        this.loadKnowledgeBaseConfig(); // Muat ulang untuk memastikan konsistensi
        this._booleanIsLoading = false; // Nonaktifkan loading setelah berhasil
      },
      error: (error) => {
        console.error('Failed to update knowledge base config:', error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to update Knowledge Base Config!'});
        this._booleanIsLoading = false; // Nonaktifkan loading jika ada error
      }
    });
  }

  public resetConfig() {
    this._arrayKnowledgeBaseConfig = { ...this._arrayOriginalConfig }; // Salin objek untuk reset
    this.messageService.add({severity:'info', summary:'Info', detail:'Knowledge Base config reset.'});
  }

  public isConfigChanged(): boolean {
    // Membandingkan objek berdasarkan stringified JSON
    return JSON.stringify(this._arrayKnowledgeBaseConfig) !== JSON.stringify(this._arrayOriginalConfig);
  }

  // Mengubah tipe event menjadi FileUploadSelectEvent dari PrimeNG
  public onFileSelected(event: any) {
    if (event.files && event.files.length > 0) {
      this._fileSelectedFile = event.files[0];
    }
  }

  // Metode untuk membersihkan file yang dipilih (dipanggil oleh onClear p-fileupload)
  public onFileClear() {
    this._fileSelectedFile = null;
  }

  public uploadFile() {
    if (!this._fileSelectedFile) {
      this.messageService.add({severity:'warn', summary:'Warning', detail:'No file selected for upload.'});
      return;
    }

    this._booleanIsLoading = true; // Set loading saat mulai upload
    this.knowledgeBaseService.uploadFile(this._fileSelectedFile).subscribe({
      next: (response) => {
        this.fetchUploadedFiles(); // Muat ulang daftar file setelah upload
        this._fileSelectedFile = null; // Reset file yang dipilih
        this.messageService.add({severity:'success', summary:'Success', detail:'File berhasil diunggah.'});
        this._booleanIsLoading = false; // Nonaktifkan loading
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Gagal mengunggah file. Silakan coba lagi nanti.'});
        this._booleanIsLoading = false; // Nonaktifkan loading jika ada error
      }
    });
  }

  public fetchUploadedFiles() {
    this.knowledgeBaseService.getUploadedFiles().subscribe({
      next: (response) => {
        if (!Array.isArray(response)) {
          console.error('Invalid response format:', response);
          this.messageService.add({severity:'error', summary:'Error', detail:'Failed to load files: Invalid data received.'});
          return;
        }
        // Pastikan properti `filename` ada dan tidak null/undefined
        this._arrayUploadedFiles = response.map((file: any) => ({
          uuid_file: file.uuid_file,
          filename: file.filename,
          // Tambahkan properti lain jika diperlukan oleh FileInfoModel
        }));
      },
      error: (error) => {
        console.error('Error fetching files:', error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Gagal memuat daftar file. Silakan coba lagi nanti.'});
      }
    });
  }

  public async embeddingFile(): Promise<void> {
    if (this._arrayUploadedFiles.length === 0) {
      this.messageService.add({severity:'warn', summary:'Warning', detail:'Tidak ada file untuk diproses embedding.'});
      return;
    }

    this._booleanIsLoading = true;
    try {
      const response = await this.knowledgeBaseService.embeddingFile().toPromise();
      if (response) {
        this.messageService.add({severity:'success', summary:'Success', detail:response.message});
      }
    } catch (error) {
      console.error('Error during embedding process:', error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Terjadi kesalahan saat embedding file. Silakan coba lagi nanti.'});
    } finally {
      this._booleanIsLoading = false;
    }
  }

  public removeFile(file: FileInfoModel) { // Menggunakan FileInfoModel sebagai tipe parameter
    if (confirm(`Apakah Anda yakin ingin menghapus file "${file.filename}"?`)) {
      this._booleanIsLoading = true; // Set loading saat mulai menghapus
      this.knowledgeBaseService.removeFile(file.uuid_file!).subscribe({
        next: (response) => {
          this.fetchUploadedFiles(); // Muat ulang daftar file
          this.messageService.add({severity:'success', summary:'Success', detail:`File "${file.filename}" berhasil dihapus.`});
          this._booleanIsLoading = false; // Nonaktifkan loading
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Gagal menghapus file. Silakan coba lagi nanti.'});
          this._booleanIsLoading = false; // Nonaktifkan loading jika ada error
        }
      });
    }
  }
}