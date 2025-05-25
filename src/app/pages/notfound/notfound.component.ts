// src/app/pages/notfound/notfound.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Diperlukan untuk routerLink
import { ButtonModule } from 'primeng/button'; // Diperlukan untuk p-button
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator'; // Jalur relatif yang benar

@Component({
    selector: 'app-notfound', // Selector untuk digunakan di rute atau komponen lain
    standalone: true, // Ini adalah komponen standalone
    imports: [
        RouterModule,
        AppFloatingConfigurator, // Pastikan ini juga standalone atau diimpor dari modulnya
        ButtonModule
    ],
    templateUrl: './notfound.component.html', // Arahkan ke file HTML terpisah
    // styleUrls: ['./notfound.component.scss'] // Opsional: jika ada styling khusus
})
export class NotfoundComponent {
    // Tidak ada logika khusus yang diperlukan di sini untuk halaman 404 sederhana
}