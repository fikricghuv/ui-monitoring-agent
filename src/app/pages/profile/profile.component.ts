import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext'; 
import { RippleModule } from 'primeng/ripple'; 
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '../services/user_profile.service'; 
import { AuthService } from '../services/auth.service';
import { UserModel, UserUpdateModel, UserChangePasswordModel } from '../models/user.model'; 
import { UserActivityLogService } from '../services/user-activity-log.service'; 
import { UserActivityLogModel } from '../models/user-activity-log.model'; 

// --- Interfaces ---
interface UserProfileData {
    id?: string;
    name: string;
    email: string;
    role: string;
    joinedDate: Date;
    status: string;
    location: string;
    phoneNumber: string; 
    lastLogin: Date;
    avatarUrl: string;
    bio: string;
}

// Tambahkan properti password ke interface EditableProfileData
interface EditableProfileData {
    name: string;
    email: string;
    phoneNumber: string;
}

// Interface baru untuk form perubahan kata sandi
interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface RecentActivity {
    id: number;
    type: string;
    description: string;
    time: string;
    details?: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        AvatarModule,
        DividerModule,
        TabViewModule,
        TagModule,
        InputTextModule, 
        RippleModule,
        ToastModule,
        ConfirmDialogModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    providers: [MessageService, ConfirmationService] 
})
export class ProfileComponent implements OnInit {

    originalProfile: UserProfileData | null = null; 
    userProfile: UserProfileData | null = null;

    editableProfile: EditableProfileData = {
        name: '', 
        email: '', 
        phoneNumber: '' 
    };

    // Objek untuk data form perubahan kata sandi
    passwordForm: PasswordFormData = {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    };

    userId: string = '';

    hasProfileChanges: boolean = false;
    hasPasswordChanges: boolean = false; // Flag terpisah untuk perubahan kata sandi

    recentActivities: UserActivityLogModel[] = [];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private authService: AuthService,
        private userActivityService: UserActivityLogService
    ) { }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile(): void {
        this.authService.getCurrentUser().subscribe({
            next: (user: any) => {
                this.userId = user.id;

                // Inisialisasi profil
                this.originalProfile = {
                    id: user.id,
                    name: user.full_name || 'N/A',
                    email: user.email,
                    phoneNumber: '', // Sesuaikan jika ada
                    role: user.role || 'User',
                    joinedDate: user.created_at ? new Date(user.created_at) : new Date(),
                    status: user.is_active ? 'Aktif' : 'Tidak Aktif',
                    location: 'Jakarta, Indonesia',
                    lastLogin: user.updated_at ? new Date(user.updated_at) : new Date(),
                    avatarUrl: '/assets/images/just-logo.png',
                    bio: 'Agen layanan pelanggan yang berdedikasi...'
                };

                this.userProfile = { ...this.originalProfile };
                this.editableProfile = {
                    name: this.originalProfile.name,
                    email: this.originalProfile.email,
                    phoneNumber: this.originalProfile.phoneNumber
                };

                this.resetPasswordForm();
                this.checkProfileChanges();

                this.loadRecentActivities();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Profil berhasil dimuat.'
                });
            },
            error: (err) => {
                console.error('Gagal memuat profil:', err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Gagal memuat data profil. ' + (err.error?.detail || err.message) 
                });
                this.originalProfile = null;
                this.userProfile = null;
                this.editableProfile = { name: '', email: '', phoneNumber: '' };
                this.hasProfileChanges = false;
                this.resetPasswordForm();
            }
        });
    }


    onInputChange(): void {
        this.checkProfileChanges();
    }

    // Fungsi baru untuk mendeteksi perubahan pada input password
    onPasswordInputChange(): void {
        this.hasPasswordChanges =
            this.passwordForm.currentPassword.trim() !== '' ||
            this.passwordForm.newPassword.trim() !== '' ||
            this.passwordForm.confirmNewPassword.trim() !== '';
    }

    checkProfileChanges(): void {
        if (this.originalProfile) {
            this.hasProfileChanges =
                this.editableProfile.name !== this.originalProfile.name ||
                this.editableProfile.email !== this.originalProfile.email ||
                this.editableProfile.phoneNumber !== this.originalProfile.phoneNumber;
        } else {
            this.hasProfileChanges = false;
        }
    }

    resetPasswordForm(): void {
        this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        };
        this.hasPasswordChanges = false;
    }

    updateProfileInfo() {
        if (!this.userId) {
            this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'ID pengguna tidak tersedia untuk pembaruan.' });
            return;
        }

        const updatePayload: UserUpdateModel = {
            full_name: this.editableProfile.name,
            email: this.editableProfile.email
            // phone_number: this.editableProfile.phoneNumber, // Uncomment jika ada di model backend
        };

        this.userService.updateUserProfile(this.userId, updatePayload).subscribe({
            next: (updatedUser: UserModel) => {
                if (this.originalProfile) {
                    this.originalProfile.name = updatedUser.full_name || 'N/A';
                    this.originalProfile.email = updatedUser.email;
                    // this.originalProfile.phoneNumber = updatedUser.phoneNumber; 
                    this.originalProfile.lastLogin = updatedUser.updated_at ? new Date(updatedUser.updated_at) : this.originalProfile.lastLogin;
                }
                
                if (this.userProfile) {
                    this.userProfile.name = updatedUser.full_name || 'N/A';
                    this.userProfile.email = updatedUser.email;
                    // this.userProfile.phoneNumber = updatedUser.phoneNumber; 
                    this.userProfile.lastLogin = updatedUser.updated_at ? new Date(updatedUser.updated_at) : this.userProfile.lastLogin;
                }

                this.checkProfileChanges();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Profil berhasil diperbarui di server.'
                });
            },
            error: (err) => {
                console.error('Gagal memperbarui profil:', err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Gagal', 
                    detail: 'Gagal memperbarui profil: ' + (err.error?.detail || err.message) 
                });
            }
        });
    }

    // --- Fungsi untuk Perubahan Kata Sandi ---
    changePassword(): void {
        if (!this.userId) {
            this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'ID pengguna tidak tersedia untuk perubahan kata sandi.' });
            return;
        }

        if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmNewPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'Semua kolom kata sandi harus diisi.' });
            return;
        }

        if (this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
            this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Kata sandi baru dan konfirmasi tidak cocok.' });
            return;
        }

        // Tambahkan validasi kekuatan kata sandi di sini jika diperlukan
        // if (this.passwordForm.newPassword.length < 8) {
        //     this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'Kata sandi baru minimal 8 karakter.' });
        //     return;
        // }

        const changePasswordPayload: UserChangePasswordModel = {
            current_password: this.passwordForm.currentPassword,
            new_password: this.passwordForm.newPassword
        };

        // this.userService.changePassword(this.userId, changePasswordPayload).subscribe({
        //     next: (response) => {
        //         // Asumsi backend mengembalikan pesan sukses
        //         this.messageService.add({
        //             severity: 'success',
        //             summary: 'Berhasil',
        //             detail: response.message || 'Kata sandi berhasil diubah.'
        //         });
        //         this.resetPasswordForm(); // Reset form setelah sukses
        //     },
        //     error: (err) => {
        //         console.error('Gagal mengubah kata sandi:', err);
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: 'Gagal',
        //             detail: 'Gagal mengubah kata sandi: ' + (err.error?.detail || err.message)
        //         });
        //     }
        // });
    }

    // --- Konfirmasi Dialog ---
    public confirmUpdateProfileInfo(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want to save these profile changes?', // Pesan yang lebih spesifik
            header: 'Confirm Profile Update',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Save',
            rejectLabel: 'Cancel',
            acceptButtonProps: {
                severity: 'success'
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.updateProfileInfo();
            },
            reject: () => {
                this.messageService.add({severity:'info', summary:'Cancelled', detail:'Profile changes were not saved.'});
            }
        });
    }

    public confirmChangePassword(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want to change your password?', // Pesan yang spesifik untuk password
            header: 'Confirm Password Change',
            icon: 'pi pi-exclamation-triangle', // Ikon yang lebih menekankan
            acceptLabel: 'Change',
            rejectLabel: 'Cancel',
            acceptButtonProps: {
                severity: 'warning' // Tombol "Change" bisa berwarna kuning/warning
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.changePassword(); // Panggil fungsi changePassword
            },
            reject: () => {
                this.messageService.add({severity:'info', summary:'Cancelled', detail:'Password change was cancelled.'});
            }
        });
    }

    // Fungsi lain yang mungkin Anda miliki, contoh:
    editProfileDetails() {
        console.log('Membuka mode edit profil... (sekarang editing inline)');
    }

    getSeverity(status: string | undefined): string { 
        if (!status) return 'info'; 
        switch (status.toLowerCase()) {
            case 'aktif':
            case 'active':
                return 'success';
            case 'tidak aktif':
            case 'inactive':
                return 'danger';
            case 'cuti':
            case 'on leave':
                return 'warning';
            default:
                return 'info';
        }
    }

    loadRecentActivities(): void {
        if (!this.userId) return;

        this.userActivityService.getActivityLogsByUserId(this.userId, 0, 5).subscribe({
            next: (activities) => {
                this.recentActivities = activities.map(activity => ({
                    ...activity,
                    type: this.mapEndpointToType(activity.endpoint)
                }));
            },
            error: (err) => {
                console.error('Gagal memuat aktivitas:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat log aktivitas.'
                });
            }
        });
    }

    mapEndpointToType(endpoint: string | undefined): string {
        if (!endpoint) return 'setting';
        const lower = endpoint.toLowerCase();
        if (lower.includes('chat')) return 'chat';
        if (lower.includes('knowledge') || lower.includes('faq')) return 'knowledge_base';
        return 'setting';
    }

    getStatusSeverity(statusCode: number): 'success' | 'info' | 'warn' | 'danger' {
        if (!statusCode) return 'info';
        if (statusCode >= 200 && statusCode < 300) return 'success';
        if (statusCode >= 400 && statusCode < 500) return 'warn';
        if (statusCode >= 500) return 'danger';
        return 'info';
    }


}