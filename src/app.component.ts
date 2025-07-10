import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatWidgetComponent } from './app/pages/chat-widget/chat-widget.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AppLayout } from "./app/layout/component/app.layout";
import { LayoutService } from './app/layout/service/layout.service';

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
export class AppComponent {
    constructor(private layoutService: LayoutService){}

    ngOnInit(): void {
        this.layoutService.initializeThemeFromSystem();
    }
}
