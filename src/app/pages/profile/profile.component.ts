import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Untuk (ngModel) jika nanti ada fitur edit

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar'; // Untuk menampilkan avatar
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview'; // Untuk tab jika ada banyak bagian
import { TagModule } from 'primeng/tag'; // Untuk status atau role

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
        TagModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'] // Opsional, jika ada styling khusus
})
export class ProfileComponent implements OnInit {

    // Data Dummy Profil Pengguna
    userProfile = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'Customer Service Agent',
        joinedDate: '15 Januari 2023',
        status: 'Aktif', // Bisa "Aktif", "Tidak Aktif", "Cuti", dll.
        location: 'Jakarta, Indonesia',
        phoneNumber: '+62 812-3456-7890',
        lastLogin: '25 Mei 2025, 11:50 WIB', // Sesuaikan dengan format waktu WIB
        avatarUrl: 'https://primefaces.org/cdn/primeng/images/avatar/anna.png', // Contoh avatar
        bio: 'Agen layanan pelanggan yang berdedikasi dengan pengalaman 2 tahun dalam membantu pengguna mengatasi masalah terkait produk asuransi.'
    };

    // Data Dummy untuk Bagian Aktivitas (Contoh)
    recentActivities = [
        { id: 1, type: 'chat', description: 'Menangani percakapan dengan User ID 1012', time: '10 menit yang lalu' },
        { id: 2, type: 'knowledge_base', description: 'Memperbarui artikel "Prosedur Klaim Asuransi Mobil"', time: '1 jam yang lalu' },
        { id: 3, type: 'setting', description: 'Mengubah pengaturan notifikasi email', time: 'Kemarin' },
        { id: 4, type: 'chat', description: 'Menyelesaikan 5 percakapan', time: '2 hari yang lalu' },
    ];

    constructor() { }

    ngOnInit(): void {
        // Logika inisialisasi, misal memuat data profil dari backend
        console.log('Profile component initialized. Loading user data...');
    }

    editProfile() {
        // Logika untuk mengarahkan ke halaman edit profil
        // Atau membuka modal/dialog untuk mengedit
        console.log('Membuka mode edit profil...');
        alert('Fitur edit profil belum diimplementasikan sepenuhnya. Ini hanya contoh.');
    }

    // Fungsi helper untuk mendapatkan warna tag berdasarkan status
    getSeverity(status: string) {
        switch (status.toLowerCase()) {
            case 'aktif':
                return 'success';
            case 'tidak aktif':
                return 'danger';
            case 'cuti':
                return 'warning';
            default:
                return 'info';
        }
    }
}