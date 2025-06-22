import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar'; 
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview'; 
import { TagModule } from 'primeng/tag'; 

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
    styleUrls: ['./profile.component.scss'] 
})
export class ProfileComponent implements OnInit {

    userProfile = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'Customer Service Agent',
        joinedDate: '15 Januari 2023',
        status: 'Aktif', 
        location: 'Jakarta, Indonesia',
        phoneNumber: '+62 812-3456-7890',
        lastLogin: '25 Mei 2025, 11:50 WIB', 
        avatarUrl: 'https://primefaces.org/cdn/primeng/images/avatar/anna.png', // Contoh avatar
        bio: 'Agen layanan pelanggan yang berdedikasi dengan pengalaman 2 tahun dalam membantu pengguna mengatasi masalah terkait produk asuransi.'
    };

    recentActivities = [
        { id: 1, type: 'chat', description: 'Menangani percakapan dengan User ID 1012', time: '10 menit yang lalu' },
        { id: 2, type: 'knowledge_base', description: 'Memperbarui artikel "Prosedur Klaim Asuransi Mobil"', time: '1 jam yang lalu' },
        { id: 3, type: 'setting', description: 'Mengubah pengaturan notifikasi email', time: 'Kemarin' },
        { id: 4, type: 'chat', description: 'Menyelesaikan 5 percakapan', time: '2 hari yang lalu' },
    ];

    constructor() { }

    ngOnInit(): void {
        console.log('Profile component initialized. Loading user data...');
    }

    editProfile() {
        
        console.log('Membuka mode edit profil...');

        alert('Fitur edit profil belum diimplementasikan sepenuhnya. Ini hanya contoh.');
    }

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