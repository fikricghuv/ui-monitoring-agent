// src/app/layout/app.topbar.ts
import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Router } from '@angular/router';

// --- PrimeNG Overlay & Menu Modules ---
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ScrollerModule } from 'primeng/scroller';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast'; 
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../pages/services/notification.service';
import { NotificationModel } from '../../pages/models/notification.model';
import { FirebaseMessagingService } from '../../pages/services/firebase-messaging.service'; 
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppConfigurator,
        SelectButtonModule,
        OverlayPanelModule,
        MenuModule,
        ButtonModule,
        ScrollerModule,
        AvatarModule,
        TooltipModule,
        ConfirmDialogModule,
        ToastModule,
        BadgeModule,
        OverlayBadgeModule
        
    ],
    templateUrl: './app.topbar.html',
    providers: [ConfirmationService, MessageService],
})
export class AppTopbar {
    items!: MenuItem[];

    @ViewChild('notificationPanel') notificationPanel: any;
    @ViewChild('profileMenu') profileMenu: any;

    unreadNotificationsCount: number = 0;
    public _stringUsername: string = '';
    public _stringPassword: string = '';

    notifications: NotificationModel[] = [];

    profileMenuItems: MenuItem[] = [
        {
            label: 'Profil Saya',
            icon: 'pi pi-user',
            command: () => {
                console.log('Melihat Profil Saya');
            },
            routerLink: '/profile'
        },
        // {
        //     label: 'Pengaturan',
        //     icon: 'pi pi-cog',
        //     routerLink: '/settings'
        // },
        { separator: true },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                this.confirmLogout();
            },
        }
    ];

    constructor(public layoutService: LayoutService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private notificationService: NotificationService,
        private firebaseMessaging: FirebaseMessagingService,
    ) {}

    ngOnInit() {
        const token = localStorage.getItem('access_token');

        if (token) {
            // Ambil notifikasi awal via HTTP
            this.notificationService.getNotifications().subscribe({
                next: (res) => {
                    this.notifications = res?.data || [];
                    this.updateUnreadCount();
                },
                error: (err) => {
                    console.error('[TOPBAR] Gagal mengambil notifikasi awal:', err.message);
                }
            });

            this.firebaseMessaging.checkNotificationPermission();

            // Request izin dan ambil token FCM
            this.firebaseMessaging.requestPermissionAndGetToken().then(token => {
            if (!token) {
                console.warn('[FCM] Tidak ada token yang diperoleh.');
                return;
            }

            const storedToken = localStorage.getItem('fcm_token');
            if (storedToken === token) {
                console.log('[FCM] Token FCM sudah tersimpan sebelumnya.');
                return;
            }

            // Simpan token baru di localStorage
            localStorage.setItem('fcm_token', token);

            // Kirim ke backend untuk disimpan
            this.notificationService.registerFCMToken(token).subscribe({
                next: () => {
                console.log('[FCM] Token berhasil diregister ke backend');

                },
                error: (err) => {
                console.error('[FCM] Gagal register token ke backend:', err);
                localStorage.removeItem('fcm_token'); 
                }
            });

            }).catch(err => {
            console.error('[FCM] Gagal meminta izin atau mengambil token:', err);
            });

            // Tangani pesan notifikasi yang masuk
            this.firebaseMessaging.onMessage((payload: any) => {
                console.log('[FCM] Notification received:', payload);

                const messageBody = payload?.notification?.body || payload?.data?.body;
                const createdAt = payload?.data?.created_at || new Date().toISOString();
                const allowedTypes = ['chat', 'info', 'warning', 'error', 'success', 'new_feature', 'promotion'];
                const type = allowedTypes.includes(payload?.data?.type) ? payload.data.type : 'info';

                if (messageBody) {
                    const isRealNotification = payload?.data?.id && payload?.data?.id.length === 36; // UUID format

                    this.notifications.unshift({
                        id: isRealNotification ? payload.data.id : crypto.randomUUID(),
                        message: messageBody,
                        type: type,
                        created_at: createdAt,
                        is_read: false
                    });

                    this.updateUnreadCount();
                } else {
                    console.warn('[FCM] Payload tidak memiliki message body:', payload);
                }
            });
        } else {
            console.warn('[TOPBAR] Token atau adminId tidak ditemukan di localStorage.');
        }
    }

    isAllNotificationsRead(): boolean {
        return this.notifications.length === 0 || this.notifications.every(n => n.is_read);
    }

    updateUnreadCount() {
        this.unreadNotificationsCount = this.notifications.filter(n => !n.is_read).length;
    }

    toggleReadStatus(notification: NotificationModel): void {
        const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(notification.id);

        const markAsRead$ = isValidUUID
            ? this.notificationService.markNotificationAsRead(notification.id)
            : undefined;

        const afterMarkRead = () => {
            notification.is_read = true;
            this.updateUnreadCount();

            if (notification.type === 'chat') {
                console.log('[ROUTER] Navigating to /pages/admin-chat');
                this.router.navigate(['/pages/admin-chat']);
            }
        };

        if (markAsRead$) {
            markAsRead$.subscribe({
                next: () => afterMarkRead(),
                error: (err) => {
                    console.error('Gagal update status read:', err);
                    afterMarkRead(); // tetap navigasi meski gagal mark read
                }
            });
        } else {
            afterMarkRead();
        }
    }

    markAllAsRead(): void {
        const unreadNotifications = this.notifications.filter(notif => !notif.is_read);

        if (unreadNotifications.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'No Unread Notifications',
                detail: 'All notifications are already marked as read.'
            });
            return;
        }

        const isUUID = (id: string) =>
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

        const validUUIDNotifs = unreadNotifications.filter(n => isUUID(n.id));
        const localOnlyNotifs = unreadNotifications.filter(n => !isUUID(n.id));

        const markReadObservables = validUUIDNotifs.map(notif =>
            this.notificationService.markNotificationAsRead(notif.id).toPromise()
        );

        Promise.allSettled(markReadObservables)
            .then(results => {
                // Tandai notifikasi UUID yang sukses
                results.forEach((res, index) => {
                    if (res.status === 'fulfilled') {
                        validUUIDNotifs[index].is_read = true;
                    } else {
                        console.error(`Gagal update notif ID ${validUUIDNotifs[index].id}`, res.reason);
                    }
                });

                // Tandai notifikasi non-UUID sebagai read secara lokal
                localOnlyNotifs.forEach(notif => notif.is_read = true);

                this.updateUnreadCount();

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


    // trackByNotificationId(index: number, notif: NotificationModel): string {
    //     return notif.id;
    // }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    toggleNotificationPanel(event: Event) {
        this.notificationPanel.toggle(event);
    }

    toggleProfileMenu(event: Event) {
        this.profileMenu.toggle(event);
    }

    viewAllNotifications() {
        console.log('Navigasi ke halaman semua notifikasi.');
        this.notificationPanel.hide();
        this.router.navigate(['/notification']);
    }

    public onLogout(): void {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('access_token_expires_at')
        localStorage.removeItem('refresh_token')
        this._stringUsername = '';
        this._stringPassword = '';

        this.messageService.add({
            severity: 'info',
            summary: 'Success logout',
            detail: 'You have successfully logged out.'
        });
    }

    public confirmLogout() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to logout?',
            header: 'Confirm Logout',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Logout',
            rejectLabel: 'Cancel',
            acceptButtonProps: {
                severity: 'danger'
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.onLogout();
                this.router.navigate(['/login']);
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Logout dibatalkan.'
                });
            }
        });
    }

}