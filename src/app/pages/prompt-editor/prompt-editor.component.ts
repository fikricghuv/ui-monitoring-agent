import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromptService } from '../services/prompt.service';
import { Prompt } from '../models/prompt.model';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ListboxModule,
    TextareaModule,
    ButtonModule,
    ToastModule,
    BreadcrumbModule,
    ConfirmDialogModule,
    InputTextModule
  ],
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['./prompt-editor.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PromptEditorComponent implements OnInit {
  public _arrayPrompts: Array<Prompt> = [];
  public _objtSelectedPrompt: Prompt = {
    id: '',
    name: '',
    name_agent: '',
    description_agent: '',
    style_communication: ''
  };
  public _objtOriginalPrompt: Prompt = {
    name: '',
    name_agent: '',
    description_agent: '',
    style_communication: ''
  };
  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;

  constructor(
    private _servicePrompt: PromptService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPrompts();
    this._listMenuItems = [{ label: 'Prompt Editor' }];
    this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  public loadPrompts() {
    this._servicePrompt.loadPrompts().subscribe({
      next: (data) => {
        this._arrayPrompts = data;
        if (this._arrayPrompts.length > 0) {
          this._objtSelectedPrompt = { ...this._arrayPrompts[0] };
          this._objtOriginalPrompt = { ...this._arrayPrompts[0] };
        }
      },
      error: (error) => {
        console.error('Error loading _arrayPrompts:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load prompts.' });
      }
    });
  }

  public onPromptSelect(event: any) {
    this._objtSelectedPrompt = { ...event.value };
    this._objtOriginalPrompt = { ...event.value };
  }

  public savePrompt() {
    this._servicePrompt
      .savePrompt(this._objtSelectedPrompt.id || '', {
        name: this._objtSelectedPrompt.name,
        name_agent: this._objtSelectedPrompt.name_agent,
        description_agent: this._objtSelectedPrompt.description_agent,
        style_communication: this._objtSelectedPrompt.style_communication
      })
      .subscribe({
        next: (response) => {
          console.log('Prompt updated successfully!', response);
          this.loadPrompts();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Prompt updated successfully!'
          });
        },
        error: (error) => {
          console.error('Error updating prompt:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update prompt.'
          });
        }
      });
  }

  public confirmSavePrompt(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to save this prompt?',
      header: 'Confirm Save',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Save',
      rejectLabel: 'Cancel',
      acceptButtonProps: {
        severity: 'success'
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true
      },
      accept: () => this.savePrompt(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Prompt was not saved.'
        });
      }
    });
  }

  public resetPrompt() {
    this._objtSelectedPrompt = { ...this._objtOriginalPrompt };
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Prompt reset to original values.'
    });
  }

  public confirmResetPrompt(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to reset this prompt?',
      header: 'Confirm Reset',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Reset',
      rejectLabel: 'Cancel',
      acceptButtonProps: {
        severity: 'success'
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true
      },
      accept: () => this.resetPrompt(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Prompt was not reset.'
        });
      }
    });
  }

  public isPromptChanged(): boolean {
    return JSON.stringify(this._objtSelectedPrompt) !== JSON.stringify(this._objtOriginalPrompt);
  }
}
