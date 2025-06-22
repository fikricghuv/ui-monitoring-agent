import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatWidgetComponent } from './app/pages/chat-widget/chat-widget.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        ChatWidgetComponent, 
    ],
    templateUrl: './app.component.html',
})
export class AppComponent {}