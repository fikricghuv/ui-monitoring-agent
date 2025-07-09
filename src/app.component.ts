import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatWidgetComponent } from './app/pages/chat-widget/chat-widget.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AppLayout } from "./app/layout/component/app.layout";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        ChatWidgetComponent,
        ProgressSpinnerModule,
        AppLayout
],
    templateUrl: './app.component.html',
})
export class AppComponent {}
