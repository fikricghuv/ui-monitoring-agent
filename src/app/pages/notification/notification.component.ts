import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple'; 
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';


interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'new_feature' | 'promotion'; 
    read: boolean;
    timestamp: Date; 
    time?: string; 
}

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        DividerModule,
        TagModule,
        RippleModule,
        ToastModule,
        ConfirmDialogModule 
    ],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'], 
    providers: [DatePipe, MessageService, ConfirmationService]
})
export class NotificationComponent implements OnInit {

    notifications: Notification[] = [];

    constructor(private datePipe: DatePipe,
                private messageService: MessageService,
                private confirmationService: ConfirmationService
    ) { } 

    ngOnInit(): void {
        this.loadNotifications();
    }

    loadNotifications(): void {
        
        const dummyNotifications: Notification[] = [
            {
                id: 1,
                title: 'New Message from Support',
                message: 'Your recent query #12345 has been updated.',
                type: 'info',
                read: false,
                timestamp: new Date(2025, 5, 25, 10, 30) 
            },
            {
                id: 2,
                title: 'System Maintenance Alert',
                message: 'Scheduled maintenance on 26 June 2025, 02:00 AM WIB.',
                type: 'warning',
                read: false,
                timestamp: new Date(2025, 5, 24, 18, 0) 
            },
            {
                id: 3,
                title: 'Payment Successful',
                message: 'Your subscription payment for June has been processed.',
                type: 'success',
                read: true,
                timestamp: new Date(2025, 5, 23, 11, 45) 
            },
            {
                id: 4,
                title: 'New Feature Available!',
                message: 'Explore our new analytics dashboard.',
                type: 'new_feature',
                read: false,
                timestamp: new Date(2025, 5, 22, 9, 0) 
            },
            {
                id: 5,
                title: 'Exclusive Offer for You',
                message: 'Get 20% off on your next purchase!',
                type: 'promotion',
                read: true,
                timestamp: new Date(2025, 5, 20, 14, 15) 
            },
             {
                id: 6,
                title: 'Login Attempt from New Device',
                message: 'Someone tried to log in from an unrecognized device.',
                type: 'error',
                read: false,
                timestamp: new Date(2025, 5, 25, 12, 10) 
            }
        ];

        this.notifications = dummyNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        this.notifications.forEach(notif => {
            notif.time = this.formatRelativeTime(notif.timestamp);
        });
    }

    toggleReadStatus(notification: Notification): void {
        notification.read = !notification.read;
        
    }

    markAllAsRead(): void {
        this.notifications.forEach(notif => notif.read = true);
        this.messageService.add({
            severity: 'success',
            summary: 'All Notifications Read',
            detail: 'All notifications have been marked as read.'
        });
    }

    clearAllNotifications(): void {
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            this.notifications = [];
            this.messageService.add({
                severity: 'success',
                summary: 'Notifications Cleared',
                detail: 'All notifications have been cleared.'
            });
        }
        
    }

    public confirmClearAllNotifications(event: Event) {
        this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to delete all notifications?',
        header: 'Confirm Delete',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptButtonProps: {
            severity: 'danger'
        },
        rejectButtonProps: {
            severity: 'secondary',
            outlined: true
        },
        accept: () => {
            this.clearAllNotifications();
        },
        reject: () => {
            this.messageService.add({severity:'info', summary:'Cancelled', detail:'Prompt was not saved.'});
        }
        });
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'info': return 'pi pi-info-circle';
            case 'warning': return 'pi pi-exclamation-triangle';
            case 'error': return 'pi pi-times-circle';
            case 'success': return 'pi pi-check-circle';
            case 'new_feature': return 'pi pi-star';
            case 'promotion': return 'pi pi-tag';
            default: return 'pi pi-bell';
        }
    }

    trackById(index: number, notification: Notification): number {
        return notification.id;
    }

    formatRelativeTime(timestamp: Date): string {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} days ago`;
        
        return this.datePipe.transform(timestamp, 'mediumDate') || timestamp.toLocaleDateString();
    }
}