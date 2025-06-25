import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Penting untuk [(ngModel)]
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext'; // Tambahkan ini untuk pInputText
import { RippleModule } from 'primeng/ripple'; // Untuk efek ripple pada tombol

// --- Interfaces ---
interface UserProfileData {
    name: string;
    email: string;
    role: string;
    joinedDate: Date; // Ubah ke Date
    status: string;
    location: string;
    phoneNumber: string;
    lastLogin: Date; // Ubah ke Date
    avatarUrl: string;
    bio: string;
}

// Tambahkan interface untuk data yang bisa diedit
interface EditableProfileData {
    name: string;
    email: string;
    phoneNumber: string;
}

// Untuk aktivitas dan statistik, jika Anda ingin menambahkannya kembali di masa depan
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
        InputTextModule, // Pastikan InputTextModule ada di sini
        RippleModule // Tambahkan RippleModule untuk efek pRipple
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    // Menyimpan data profil asli untuk perbandingan
    originalProfile: UserProfileData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'Admin',
        joinedDate: new Date('2023-01-15'), // Menggunakan objek Date
        status: 'Aktif',
        location: 'Jakarta, Indonesia',
        phoneNumber: '+62 812-3456-7890',
        lastLogin: new Date('2025-05-25T11:50:00Z'), // Menggunakan objek Date
        avatarUrl: '/assets/images/just-logo.png',
        bio: 'Agen layanan pelanggan yang berdedikasi dengan pengalaman 2 tahun dalam membantu pengguna mengatasi masalah terkait produk asuransi.'
    };

    // Ini akan digunakan untuk menampilkan bagian profil yang tidak diedit (misalnya nama di header, role, dll.)
    userProfile: UserProfileData = { ...this.originalProfile };

    // Ini akan diikat ke input text dan digunakan untuk deteksi perubahan
    editableProfile: EditableProfileData = {
        name: '', // Akan diisi di ngOnInit
        email: '', // Akan diisi di ngOnInit
        phoneNumber: '' // Akan diisi di ngOnInit
    };

    // Flag untuk mengontrol status button "Update Profile"
    hasProfileChanges: boolean = false;

    // Data aktivitas terbaru (pertahankan jika masih relevan untuk tab tersebut)
    recentActivities: RecentActivity[] = [
        { id: 1, type: 'chat', description: 'Menangani percakapan dengan User ID 1012', time: '10 menit yang lalu' },
        { id: 2, type: 'knowledge_base', description: 'Memperbarui artikel "Prosedur Klaim Asuransi Mobil"', time: '1 jam yang lalu' },
        { id: 3, type: 'setting', description: 'Mengubah pengaturan notifikasi email', time: 'Kemarin' },
        { id: 4, type: 'chat', description: 'Menyelesaikan 5 percakapan', time: '2 hari yang lalu' },
    ];

    constructor() { }

    ngOnInit(): void {
        console.log('Profile component initialized. Loading user data...');
        // Inisialisasi editableProfile dengan nilai dari originalProfile
        this.editableProfile.name = this.originalProfile.name;
        this.editableProfile.email = this.originalProfile.email;
        this.editableProfile.phoneNumber = this.originalProfile.phoneNumber;

        // Panggil ini di awal untuk memastikan tombol disabled jika tidak ada perubahan
        this.checkProfileChanges();
    }

    // Dipanggil setiap kali ada perubahan pada input text
    onInputChange(): void {
        this.checkProfileChanges();
    }

    // Memeriksa apakah ada perubahan pada data profil yang bisa diedit
    checkProfileChanges(): void {
        this.hasProfileChanges =
            this.editableProfile.name !== this.originalProfile.name ||
            this.editableProfile.email !== this.originalProfile.email ||
            this.editableProfile.phoneNumber !== this.originalProfile.phoneNumber;
    }

    // Fungsi untuk memperbarui informasi profil
    updateProfileInfo() {
        console.log('Menyimpan perubahan profil...');
        // Di sini Anda akan mengirim data yang diperbarui ke backend
        // Contoh: this.profileService.updateProfile(this.editableProfile).subscribe(...);

        // Setelah berhasil disimpan, perbarui originalProfile dengan data baru
        // agar tombol kembali disabled sampai ada perubahan lagi
        this.originalProfile.name = this.editableProfile.name;
        this.originalProfile.email = this.editableProfile.email;
        this.originalProfile.phoneNumber = this.editableProfile.phoneNumber;

        // Perbarui juga userProfile (yang ditampilkan di luar input)
        this.userProfile.name = this.editableProfile.name;
        this.userProfile.email = this.editableProfile.email;
        this.userProfile.phoneNumber = this.editableProfile.phoneNumber;


        this.checkProfileChanges(); // Cek ulang status perubahan setelah update
        // Anda mungkin ingin menampilkan notifikasi 'Berhasil disimpan' di sini
    }


    // Fungsi lain yang mungkin Anda miliki, contoh:
    editProfileDetails() {
        console.log('Membuka mode edit profil... (sekarang editing inline)');
    }

    getSeverity(status: string): string {
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
}