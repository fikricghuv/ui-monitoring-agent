import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatWidgetComponent } from './app/pages/chat-widget/chat-widget.component';
import { BreadcrumbWidgetComponent } from './app/pages/breadcrumb-widget/breadcrumb-widget.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        ChatWidgetComponent, // Tambahkan ChatWidgetComponent di imports
    ],
    template: `
        <router-outlet></router-outlet>
        <app-chat-widget></app-chat-widget>
        `
})
export class AppComponent {}