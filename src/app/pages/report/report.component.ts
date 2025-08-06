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
import { ReportService } from '../services/report.service';

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
        CardModule,
    ],
    templateUrl: './report.component.html',
    styleUrl: './report.component.scss',
    providers: [MessageService],
})

export class ReportComponent implements OnInit {
    public _listMenuItems: MenuItem[] | undefined;
    public _defaultHomeMenu: MenuItem | undefined;

    private platformId = inject(PLATFORM_ID);
    private messageService = inject(MessageService);

    private reportService = inject(ReportService);

    rangeDates: Date[] | undefined;

    reportTypes: ReportType[] = [];
    selectedReportType: ReportType | undefined;

    ngOnInit(): void {
        this._listMenuItems = [
            { label: 'Report' }
        ];
        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.reportTypes = [
            { name: 'Customer Profile', code: 'CUSTOMER_PROFILE' },
            { name: 'Customer Interaction', code: 'CUSTOMER_INTERACTION'},
            { name: 'Most Question', code: 'MOST_QUESTION' },
            { name: 'Customer Feedback', code: 'CUSTOMER_FEEDBACK' },
            { name: 'Chat History', code: 'CHAT_HISTORY' },
            { name: 'All Data', code: 'ALL_DATA' }
        ];

    }

    downloadReport(): void {
        if (!isPlatformBrowser(this.platformId)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Download hanya tersedia di browser.'
            });
            return;
        }

        if (!this.selectedReportType) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Silakan pilih jenis laporan.'
            });
            return;
        }

        if (!this.rangeDates || this.rangeDates.length !== 2 || !this.rangeDates[0] || !this.rangeDates[1]) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Silakan pilih rentang tanggal yang valid.'
            });
            return;
        }

        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const startDate = formatDate(this.rangeDates[0]);
        const endDate = formatDate(this.rangeDates[1]);

        this.messageService.add({
            severity: 'info',
            summary: 'Downloading',
            detail: `Mempersiapkan laporan: ${this.selectedReportType.name} dari ${startDate} hingga ${endDate}...`
        });

        this.reportService.downloadCSVReport(
            this.selectedReportType.code,
            startDate,
            endDate
        ).subscribe({
            next: (blob) => {
                const filename = `${this.selectedReportType?.code}_${startDate}_to_${endDate}.csv`;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: `Laporan '${this.selectedReportType?.name}' berhasil diunduh.`
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: error.message || 'Terjadi kesalahan saat mengunduh laporan.'
                });
            }
        });
    }
}