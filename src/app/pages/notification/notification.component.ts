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
import { NotificationService } from '../../pages/services/notification.service';
import { environment } from '../../../environments/environment';

interface Notification {
    id: string;
    message: string;
    type: 'chat' | 'info' | 'warning' | 'error' | 'success' | 'new_feature' | 'promotion';
    is_read: boolean;
    created_at: string; 
    time?: string;
    title?: string; 
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
    userId!: string;

    constructor(
        private datePipe: DatePipe,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        const userId = localStorage.getItem('adminId');

        if (userId) {
            this.notificationService.getNotifications().subscribe({
                next: (res) => {
                    this.notifications = res.data.map((n) => {
                        const allowedTypes = [
                            'chat',
                            'info',
                            'warning',
                            'error',
                            'success',
                            'new_feature',
                            'promotion'
                        ] as const;
                        const type = allowedTypes.includes(n.type as Notification['type']) ? n.type as Notification['type'] : 'info';
                        return {
                            ...n,
                            type,
                            is_read: n.is_read ?? false,
                            time: this.formatRelativeTime(new Date(n.created_at)),
                            title: this.getTitleFromType(type)
                        };
                    });
                },
                error: (err) => {
                    console.error('Gagal mengambil notifikasi:', err);
                }
            });

        }
    }

    toggleReadStatus(notification: Notification): void {
        if (!notification.is_read) {
            // const userId = localStorage.getItem('adminId');
            // if (!userId) return;

            this.notificationService.markNotificationAsRead(notification.id).subscribe({
                next: () => {
                    notification.is_read = true;
                },
                error: (err) => {
                    console.error('Gagal update status read:', err);
                }
            });
        }
    }

    markAllAsRead(): void {
        // const userId = localStorage.getItem('adminId');
        // if (!userId) return;

        const unreadNotifications = this.notifications.filter(notif => !notif.is_read);

        if (unreadNotifications.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'No Unread Notifications',
                detail: 'All notifications are already marked as read.'
            });
            return;
        }

        const markReadObservables = unreadNotifications.map(notif =>
            this.notificationService.markNotificationAsRead(notif.id)
        );

        // Jalankan semua API call secara paralel
        Promise.all(markReadObservables.map(obs => obs.toPromise()))
            .then(() => {
                // Setelah semua sukses, tandai semua sebagai read
                this.notifications.forEach(notif => notif.is_read = true);
                this.messageService.add({
                    severity: 'success',
                    summary: 'All Notifications Read',
                    detail: 'All notifications have been marked as read.'
                });
            })
            .catch(err => {
                console.error('Gagal menandai beberapa notifikasi:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Some notifications could not be marked as read.'
                });
            });
    }

    clearAllNotifications(): void {    
        this.notificationService.deactivateAllActiveNotifications().subscribe({
            next: () => {
                console.log('Semua notifikasi aktif berhasil dinonaktifkan.');
            },
            error: (err) => {
                console.error('Gagal menonaktifkan notifikasi:', err);
            },
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Notifications Cleared',
            detail: 'All notifications have been cleared.'
        });
    }

    confirmClearAllNotifications(event: Event) {
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
                this.messageService.add({
                    severity:'info',
                    summary:'Cancelled',
                    detail:'Cancle clear notifications.'
                });
            }
        });
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'chat': return 'pi pi-comments';
            case 'info': return 'pi pi-info-circle';
            case 'warning': return 'pi pi-exclamation-triangle';
            case 'error': return 'pi pi-times-circle';
            case 'success': return 'pi pi-check-circle';
            case 'new_feature': return 'pi pi-star';
            case 'promotion': return 'pi pi-tag';
            default: return 'pi pi-bell';
        }
    }

    getTitleFromType(type: string): string {
        switch (type) {
            case 'chat': return 'New Message';
            case 'info': return 'Information';
            case 'warning': return 'Warning Alert';
            case 'error': return 'Error';
            case 'success': return 'Success';
            case 'new_feature': return 'New Feature!';
            case 'promotion': return 'Special Promotion';
            default: return 'Notification';
        }
    }

    trackById(index: number, notification: Notification): string {
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
