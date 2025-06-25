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
})

export class ReportComponent implements OnInit {
    public _listMenuItems: MenuItem[] | undefined;
    public _defaultHomeMenu: MenuItem | undefined;

    private platformId = inject(PLATFORM_ID);
    private messageService = inject(MessageService);

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
            { name: 'Most Question', code: 'MOST_QUESTION' },
            { name: 'Customer Feedback', code: 'CUSTOMER_FEEDBACK' },
            { name: 'All Data', code: 'ALL_DATA' }
        ];

    }

    downloadReport(): void {
        
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

        const startDate = this.rangeDates[0].toISOString().split('T')[0]; 
        const endDate = this.rangeDates[1].toISOString().split('T')[0]; 

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

        setTimeout(() => {
            
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Laporan '${this.selectedReportType?.name}' berhasil diunduh!`
            });

        }, 2000); 
    }
}