// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router'; 
import { Subscription } from 'rxjs';
import { ChatWidgetComponent } from './app/pages/chat-widget/chat-widget.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LayoutService } from './app/layout/service/layout.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ErrorHandlingService } from './app/pages/services/error-handling.service'; 

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        ChatWidgetComponent,
        ProgressSpinnerModule,
        DialogModule,
        ButtonModule
    ],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
    displayModal = false;
    modalMessage = '';
    modalDetail = '';
    
    private errorSubscription!: Subscription;
    
    constructor(
        private layoutService: LayoutService,
        private router: Router,
        private errorHandlingService: ErrorHandlingService // Inject ErrorHandlingService
    ) {}

    ngOnInit(): void {
        this.layoutService.initializeThemeFromSystem();
        
        this.errorSubscription = this.errorHandlingService.errorMessage$.subscribe(error => {
            this.modalMessage = error.message;
            this.modalDetail = error.detail;
            this.displayModal = true;
        });
    }

    onOkClick(): void {
        this.displayModal = false; 
        
        if (this.modalMessage === 'Sesi Berakhir') {
            this.router.navigate(['/login']);
        }
    }

    ngOnDestroy(): void {
        if (this.errorSubscription) {
            this.errorSubscription.unsubscribe(); 
        }
    }
}