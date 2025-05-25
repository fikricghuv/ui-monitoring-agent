import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Penting untuk two-way data binding (ngModel)

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast'; // Untuk notifikasi setelah simpan
import { MessageService } from 'primeng/api'; // Service untuk Toast

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, // Jangan lupa FormsModule
        CardModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        DividerModule,
        InputSwitchModule,
        ToastModule // Impor ToastModule
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'], // Opsional, jika ada styling khusus
    providers: [MessageService] // Sediakan MessageService di komponen ini
})
export class SettingsComponent implements OnInit {

    // --- Data Dummy Pengaturan ---
    // General Settings
    username: string = 'JaneDoe';
    email: string = 'jane.doe@example.com';

    // Security Settings
    currentPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';

    // Notification Settings
    enableEmailNotifications: boolean = true;
    enablePushNotifications: boolean = false;
    notifyOnNewMessage: boolean = true;
    notifyOnTaskAssignment: boolean = true;

    constructor(private messageService: MessageService) { }

    ngOnInit(): void {
        // Logika inisialisasi, misal memuat data pengaturan dari backend
        console.log('Settings component initialized.');
    }

    saveGeneralSettings() {
        // Logika untuk menyimpan pengaturan umum ke backend
        console.log('Saving General Settings:', { username: this.username, email: this.email });
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pengaturan Umum berhasil disimpan.'
        });
    }

    changePassword() {
        if (this.newPassword !== this.confirmNewPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Gagal',
                detail: 'Password baru dan konfirmasi password tidak cocok.'
            });
            return;
        }
        if (this.newPassword.length < 6) { // Contoh validasi sederhana
            this.messageService.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Password baru minimal 6 karakter.'
            });
            return;
        }
        // Logika untuk mengubah password ke backend
        console.log('Changing password:', { currentPassword: this.currentPassword, newPassword: this.newPassword });
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Password berhasil diubah.'
        });
        // Reset field password setelah berhasil
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
    }

    saveNotificationSettings() {
        // Logika untuk menyimpan pengaturan notifikasi ke backend
        console.log('Saving Notification Settings:', {
            enableEmailNotifications: this.enableEmailNotifications,
            enablePushNotifications: this.enablePushNotifications,
            notifyOnNewMessage: this.notifyOnNewMessage,
            notifyOnTaskAssignment: this.notifyOnTaskAssignment
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pengaturan Notifikasi berhasil disimpan.'
        });
    }
}