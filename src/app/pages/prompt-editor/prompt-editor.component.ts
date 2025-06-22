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
    BreadcrumbModule
  ],
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['./prompt-editor.component.scss'],
  providers: [MessageService] 
})
export class PromptEditorComponent implements OnInit {
  public _arrayPrompts: Array<Prompt>;
  public _objtSelectedPrompt: Prompt;
  public _stringOriginalContent: string;
  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;

  constructor(
    private _servicePrompt: PromptService,
    private messageService: MessageService 
  ) {
    this._arrayPrompts = [];
    this._objtSelectedPrompt = { name: '', content: '' };
    this._stringOriginalContent = ''; 
  }

  ngOnInit() {
    this.loadPrompts();
    this._listMenuItems = [
            { label: 'Prompt Editor' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  public loadPrompts() {
    this._servicePrompt.loadPrompts().subscribe({
      next: (data) => {

        this._arrayPrompts = data;

        console.log("Memuat daftar prompt: ", data);

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

  public onPromptSelect(event: any) {

    this._objtSelectedPrompt = { ...event.value }; 

    this._stringOriginalContent = this._objtSelectedPrompt.content || ''; 
  }

  public savePrompt() {

    this._servicePrompt.savePrompt(this._objtSelectedPrompt.name || '', this._objtSelectedPrompt.content || '')
      .subscribe({
        next: (response) => {
          
          console.log('Prompt updated successfully!', response);
          
          this.loadPrompts();
          
          this._stringOriginalContent = this._objtSelectedPrompt.content || '';
          
          this.messageService.add({severity:'success', summary:'Success', detail:'Prompt updated successfully!'});
        },
        error: (error) => {
          
          console.error('Error updating prompt:', error);
          
          this.messageService.add({severity:'error', summary:'Error', detail:'Failed to update prompt.'});
        }
      });
  }

  public resetPrompt() {
    
    this._objtSelectedPrompt.content = this._stringOriginalContent;
    
    this.messageService.add({severity:'info', summary:'Info', detail:'Prompt content reset.'});
  }

  public isPromptChanged(): boolean {

    return this._objtSelectedPrompt.content !== this._stringOriginalContent;
  }
}