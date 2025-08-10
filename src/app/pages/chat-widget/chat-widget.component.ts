// src/app/components/chat-widget/chat-widget.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SessionService } from '../services/session.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ENUM_SENDER } from '../constants/enum.constant'
import { ChatCoreService } from '../services/user-chat-core.service';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonModule], 
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  
  public _booleanIsOpen: boolean = false; 
  public _booleanShowNotificationBubble: boolean = false; 
  public _numberUnreadMessageCount: number = 0; 

  private _stringUserId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private chatCoreService: ChatCoreService 
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
          this.subscribeToIncomingMessages(); 
        } else {
          console.error('ChatWidget: User ID is null after session initialization. Cannot setup widget.');
        }
      });
  }

  ngAfterViewInit(): void {
  }

  private subscribeToIncomingMessages(): void {
    this.chatCoreService.incomingMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
       
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

  toggleChat(): void {
    this._booleanIsOpen = !this._booleanIsOpen;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 5);
    
    console.log(`Chat modal is now: ${this._booleanIsOpen ? 'Open' : 'Closed'}`);

    if (this._booleanIsOpen) {
      this._numberUnreadMessageCount = 0;

      this._booleanShowNotificationBubble = false;
    }
    this.cdr.detectChanges();
  }

}