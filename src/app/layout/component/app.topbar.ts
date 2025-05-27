// src/app/layout/app.topbar.ts
import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { SelectButtonModule } from 'primeng/selectbutton';

// --- PrimeNG Overlay & Menu Modules ---
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ScrollerModule } from 'primeng/scroller';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip'; // <--- INI YANG HILANG DAN PERLU DITAMBAHKAN

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
        TooltipModule // <--- Tambahkan TooltipModule di sini
    ],
    templateUrl: './app.topbar.html'
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
        { id: 6, message: 'Pengguna baru mendaftar di Collabor IQ!', time: '1 minggu yang lalu', read: false },
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
                this.onLogout();
                // console.log('Melakukan Logout');
            },
            routerLink: '/login'
        }
    ];

    constructor(public layoutService: LayoutService) {}

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
    }

    public onLogout(): void {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('access_token');
        this._stringUsername = '';
        this._stringPassword = '';
        alert('You have been logged out.');
    }
}