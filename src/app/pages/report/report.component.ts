import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'; 
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';

interface ReportType {
    name: string;
    code: string;
}

@Component({
  selector: 'app-report',
  imports: [
        CommonModule,
        FormsModule,
        CalendarModule,
        DropdownModule,
        ButtonModule,
        ToastModule,
        BreadcrumbModule,
        CardModule 
    ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  providers: [MessageService], 
  // host: {
  //     class: 'h-full flex-1 flex flex-col overflow-hidden border border-surface rounded-2xl p-6'
  // }
})

export class ReportComponent implements OnInit {
    public _listMenuItems: MenuItem[] | undefined;
    public _defaultHomeMenu: MenuItem | undefined;

    // Inject PLATFORM_ID untuk SSR
    private platformId = inject(PLATFORM_ID);
    // Inject MessageService untuk notifikasi Toast
    private messageService = inject(MessageService);

    // Properti untuk filter jangka waktu
    rangeDates: Date[] | undefined;

    // Properti untuk dropdown jenis laporan
    reportTypes: ReportType[] = [];
    selectedReportType: ReportType | undefined;

    ngOnInit(): void {
      this._listMenuItems = [
        { label: 'Report' }
      ];
      this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.reportTypes = [
            { name: 'Customer Profile', code: 'CUSTOMER_PROFILE' },
            { name: 'Most Question', code: 'MOST_QUESTION' },
            { name: 'Customer Feedback', code: 'CUSTOMER_FEEDBACK' },
            { name: 'All Data', code: 'ALL_DATA' }
        ];

        // Opsional: set nilai default untuk rentang tanggal atau jenis laporan
        // const today = new Date();
        // const thirtyDaysAgo = new Date(today);
        // thirtyDaysAgo.setDate(today.getDate() - 30);
        // this.rangeDates = [thirtyDaysAgo, today];
        // this.selectedReportType = this.reportTypes[0]; // Pilih 'Customer Profile' sebagai default
    }

    /**
     * Metode untuk menangani logika pengunduhan laporan.
     * Di sini Anda akan mengintegrasikan logika backend untuk menghasilkan dan mengunduh file.
     */
    downloadReport(): void {
        // Hanya jalankan logika unduh jika di browser (penting untuk SSR)
        if (!isPlatformBrowser(this.platformId)) {
            console.warn('Download functionality is only available in the browser.');
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Download hanya tersedia di browser.' });
            return;
        }

        if (!this.selectedReportType) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Silakan pilih jenis laporan.' });
            return;
        }

        if (!this.rangeDates || this.rangeDates.length !== 2 || !this.rangeDates[0] || !this.rangeDates[1]) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Silakan pilih rentang tanggal yang valid.' });
            return;
        }

        const startDate = this.rangeDates[0].toISOString().split('T')[0]; // Format YYYY-MM-DD
        const endDate = this.rangeDates[1].toISOString().split('T')[0]; // Format YYYY-MM-DD

        this.messageService.add({
            severity: 'info',
            summary: 'Downloading',
            detail: `Mempersiapkan laporan: ${this.selectedReportType.name} dari ${startDate} hingga ${endDate}...`
        });

        console.log('Request Download Report:', {
            reportType: this.selectedReportType.code,
            startDate: startDate,
            endDate: endDate
        });

        // --- Logika Unduh Laporan Sesungguhnya ---
        // Di sini Anda akan memanggil service Angular yang berinteraksi dengan API backend Anda.
        // Contoh placeholder (Anda perlu menggantinya dengan logika nyata):
        setTimeout(() => {
            // Simulasikan keberhasilan unduh
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Laporan '${this.selectedReportType?.name}' berhasil diunduh!`
            });

            // Contoh cara mengunduh file dummy (ganti dengan respons API Anda)
            // const dummyData = 'Ini adalah konten laporan dummy.';
            // const blob = new Blob([dummyData], { type: 'text/csv' });
            // const url = window.URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = `${this.selectedReportType?.code}_${startDate}_${endDate}.csv`;
            // document.body.appendChild(a);
            // a.click();
            // window.URL.revokeObjectURL(url);
            // document.body.removeChild(a);

        }, 2000); // Simulasi penundaan pengunduhan
    }
}