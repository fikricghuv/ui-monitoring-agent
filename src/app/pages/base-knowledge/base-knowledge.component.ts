import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { FileInfoModel } from '../models/file_info.model';
import { KnowledgeBaseConfigModel } from '../models/knowledge_base_config.model';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUploadEvent } from 'primeng/fileupload'; 
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast'; 
import { TooltipModule } from 'primeng/tooltip'; 
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppConfigurator } from '../../layout/component/app.configurator';
import { TagModule } from 'primeng/tag';
import { Observable, forkJoin } from 'rxjs';
import { UploadResponseModel } from '../models/upload_file_response.model';
import { FileSelectEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-base-knowledge',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    CardModule,          
    FieldsetModule,      
    InputNumberModule,   
    ButtonModule,        
    FileUploadModule,    
    ListboxModule,       
    ProgressSpinnerModule, 
    ToastModule,         
    TooltipModule,     
    BreadcrumbModule,
    ConfirmDialogModule,
    TagModule
  ],
  templateUrl: './base-knowledge.component.html',
  styleUrl: './base-knowledge.component.scss',
  providers: [MessageService, ConfirmationService] 
})
export class BaseKnowledgeComponent implements OnInit {
  public _fileSelectedFile: File | null;
  public _fileSelectedFiles: File[];
  public _arrayUploadedFiles: Array<FileInfoModel>;
  public _arrayKnowledgeBaseConfig: KnowledgeBaseConfigModel;
  public _arrayOriginalConfig: KnowledgeBaseConfigModel; 
  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;
  public _appConfigurator: AppConfigurator;

  @ViewChild('fileUploader') fileUploader: any;

  constructor(
    private knowledgeBaseService: KnowledgeBaseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService 
  ) {
    this._fileSelectedFile = null;
    this._arrayUploadedFiles = [];
    this._fileSelectedFiles = [];
    this._arrayKnowledgeBaseConfig = { chunk_size: 0, overlap: 0, num_documents: 0 };
    this._arrayOriginalConfig = { chunk_size: 0, overlap: 0, num_documents: 0 };
    this._appConfigurator = new AppConfigurator();
  }

  ngOnInit() {
    this.fetchUploadedFiles();
    this._listMenuItems = [
            { label: 'Base Knowledge' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this._appConfigurator.hideLoading();
  }

  public onFileClear() {
    this._fileSelectedFile = null;
    this._fileSelectedFiles = [];
  }

  public onRemoveFile(event: { file: File }) {
    const removedFile = event.file;
    this._fileSelectedFiles = this._fileSelectedFiles.filter(f => f.name !== removedFile.name);
  }


  public uploadFiles() {
    if (!this._fileSelectedFiles || this._fileSelectedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No files selected for upload.'
      });
      return;
    }

    this._appConfigurator.showLoading();

    const uploadObservables = this._fileSelectedFiles.map(file =>
      this.knowledgeBaseService.uploadFile(file)
    );

    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        this.fetchUploadedFiles();
        this._fileSelectedFiles = [];
        
        if (this.fileUploader) {
          this.fileUploader.clear();
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Semua file berhasil diunggah.'
        });

        this._appConfigurator.hideLoading();
      },
      error: (error) => {
        console.error('Error uploading files:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal mengunggah satu atau lebih file.'
        });
        this._appConfigurator.hideLoading();
      }
    });
  }

  public onUpload(event: any): void {
    this.confirmUploadFiles();
  }

  public onFileSelected(event: FileSelectEvent) {
    const selectedFiles = Array.from(event.files);
    const existingFilenames = this._arrayUploadedFiles.map(file => (file.filename ?? '').toLowerCase());

    const duplicateFiles = selectedFiles
      .filter(file => existingFilenames.includes(file.name.toLowerCase()))
      .map(file => file.name);

    if (duplicateFiles.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'File Duplikat',
        detail: `File berikut sudah pernah diunggah: ${duplicateFiles.join(', ')}`
      });

      if (this.fileUploader) {
        this.fileUploader.clear();
      }
      this._fileSelectedFiles = [];
    } else {
      this._fileSelectedFiles = selectedFiles;
    }
  }


  public fetchUploadedFiles() {
    this.knowledgeBaseService.getUploadedFiles().subscribe({
      next: (response) => {
        console.log('📦 Fetched files from API:', response);
        if (!Array.isArray(response)) {
          console.error('Invalid response format:', response);
          
          this.messageService.add({
            severity:'error', 
            summary:'Error', 
            detail:'Failed to load files: Invalid data received.'
          });
          
          return;
        }
        console.log('File response:', response);
        
        this._arrayUploadedFiles = response.map((file: any) => ({
          uuid_file: file.uuid_file,
          filename: file.filename,
          uploaded_at: file.uploaded_at,
          status: file.status,
        }));
        
      },
      error: (error) => {
        console.error('Error fetching files:', error);
        
        this.messageService.add({
          severity:'error', 
          summary:'Error', 
          detail:'Gagal memuat daftar file. Silakan coba lagi nanti.'
        });
      }
    });
  }

  public async embeddingFile(): Promise<void> {
    if (this._arrayUploadedFiles.length === 0) {
      
      this.messageService.add({
        severity:'warn', 
        summary:'Warning', 
        detail:'Tidak ada file untuk diproses embedding.'
      });
      
      return;
    }

   this._appConfigurator.showLoading();
    this._appConfigurator.showLoading();
    try {
      const response = await this.knowledgeBaseService.embeddingFile().toPromise();
      if (response) {
        this.messageService.add({
          severity:'success', 
          summary:'Success', 
          detail:'Proses embedding file berhasil.'
        });
      }
    } catch (error) {
      console.error('Error during embedding process:', error);
      this.messageService.add({
        severity:'error', 
        summary:'Error', 
        detail:'Terjadi kesalahan saat embedding file. Silakan coba lagi nanti.'
      });

    } finally {
      this._appConfigurator.hideLoading();
      this._appConfigurator.hideLoading();
      this.fetchUploadedFiles()
    }
  }

  public removeFile(file: FileInfoModel) { 
   this._appConfigurator.showLoading();
    this.knowledgeBaseService.removeFile(file.uuid_file!).subscribe({
      next: (response) => {
        this.fetchUploadedFiles(); 
        
        this.messageService.add({
          severity:'success', 
          summary:'Success', 
          detail:`File "${file.filename}" berhasil dihapus.`
        });

        this._appConfigurator.hideLoading();
      },
      error: (error) => {
        console.error('Error deleting file:', error);
        
        this.messageService.add({
          severity:'error', 
          summary:'Error', 
          detail:'Gagal menghapus file. Silakan coba lagi nanti.'
        });

        this._appConfigurator.hideLoading(); 
      }
    });
  }

  public confirmUploadFiles(event?: Event): void {
    if (!this._fileSelectedFiles) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Tidak ada file yang dipilih untuk diunggah.'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: `Anda yakin ingin mengunggah "${this._fileSelectedFiles.length} file"?`,
      header: 'Konfirmasi Upload',
      icon: 'pi pi-upload',
      acceptLabel: 'Upload',
      rejectLabel: 'Batal',
      rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
      accept: () => this.uploadFiles(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Dibatalkan',
          detail: 'Proses upload dibatalkan.'
        });
      }
    });
  }

  public confirmRemoveFile(event: Event, file: FileInfoModel): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Apakah Anda yakin ingin menghapus file "${file.filename}"?`,
      header: 'Konfirmasi Penghapusan',
      icon: 'pi pi-trash',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
      accept: () => this.removeFile(file),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Dibatalkan',
          detail: 'Penghapusan file dibatalkan.'
        });
      }
    });
  }

  public confirmEmbeddingFile(event: Event): void {

    if (this._arrayUploadedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Tidak ada file untuk diproses embedding.'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Proses ini akan memulai embedding untuk semua file yang diunggah. Lanjutkan?',
      header: 'Konfirmasi Embedding',
      icon: 'pi pi-sync',
      acceptLabel: 'Proses',
      rejectLabel: 'Batal',
      rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
      accept: () => this.embeddingFile(), 
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Dibatalkan',
          detail: 'Proses embedding dibatalkan.'
        });
      }
    });
  }

  public get isProcessDisabled(): boolean {
    return !this._arrayUploadedFiles.some(file => file.status === 'pending');
  }


}

