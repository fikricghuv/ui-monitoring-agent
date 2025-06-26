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
        ConfirmDialogModule
        
    ],
    templateUrl: './app.topbar.html',
    providers: [ConfirmationService, MessageService],
})
export class AppTopbar {
    items!: MenuItem[];

    @ViewChild('notificationPanel') notificationPanel: any;
    @ViewChild('profileMenu') profileMenu: any;

    unreadNotificationsCount: number = 5;
    public _stringUsername: string = '';
    public _stringPassword: string = '';

    dummyNotifications = [
        { id: 1, message: 'Pesan baru dari John Doe.', time: '2 menit yang lalu', read: false },
        { id: 2, message: 'Tugas "Review dokumentasi" jatuh tempo besok.', time: '1 jam yang lalu', read: false },
        { id: 3, message: 'Update sistem berhasil diselesaikan.', time: 'Kemarin', read: true },
        { id: 4, message: 'Pengingat: Rapat tim pukul 10 pagi.', time: '2 hari yang lalu', read: false },
        { id: 5, message: 'Pembayaran untuk faktur #12345 diterima.', time: '3 hari yang lalu', read: true },
        { id: 6, message: 'Pengguna baru mendaftar di TalkVera!', time: '1 minggu yang lalu', read: false },
        { id: 7, message: 'Pemeliharaan server dijadwalkan Senin depan.', time: '1 minggu yang lalu', read: false }
    ];

    profileMenuItems: MenuItem[] = [
        {
            label: 'Profil Saya',
            icon: 'pi pi-user',
            command: () => {
                console.log('Melihat Profil Saya');
            },
            routerLink: '/profile'
        },
        {
            label: 'Pengaturan',
            icon: 'pi pi-cog',
            routerLink: '/settings'
        },
        { separator: true },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                // this.onLogout();
                this.confirmLogout();
            },
            // routerLink: '/login'
        }
    ];

    constructor(public layoutService: LayoutService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    toggleNotificationPanel(event: Event) {
        this.notificationPanel.toggle(event);
    }

    toggleProfileMenu(event: Event) {
        this.profileMenu.toggle(event);
    }

    markAsRead(notificationId: number) {
        const notification = this.dummyNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    viewAllNotifications() {
        console.log('Navigasi ke halaman semua notifikasi.');
        this.notificationPanel.hide();
        this.router.navigate(['/notification']);
    }

    public onLogout(): void {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('access_token');
        this._stringUsername = '';
        this._stringPassword = '';

        // Notifikasi (gunakan messageService saja, hindari alert browser)
        this.messageService.add({
            severity: 'info',
            summary: 'Success logout',
            detail: 'You have successfully logged out.'
        });
    }


    markAllAsRead(): void {
        this.dummyNotifications.forEach(notif => notif.read = true);
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