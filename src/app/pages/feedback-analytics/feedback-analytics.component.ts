import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { FeedbackModel } from '../models/feedback.model';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api'; // Pastikan ini diimpor
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-feedback-analytics',
  standalone: true,
  imports: [CommonModule, PaginatorModule, 
    IconFieldModule, InputIconModule, TableModule, BreadcrumbModule],
  templateUrl: './feedback-analytics.component.html',
  styleUrl: './feedback-analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  public _arrayFeedbackModel: Array<FeedbackModel>; // Ini akan menyimpan data yang ditampilkan di tabel
  public _booleanIsLoading: boolean;
  public _stringErrorText: string;

  // Properti PrimeNG Table
  public _numberFirst: number = 0; // Posisi record pertama di tabel
  public _numberRows: number = 10; // Jumlah baris per halaman
  public _numberTotalRecords: number = 0; // Total record dari backend
  public items: MenuItem[] | undefined;
  public home: MenuItem | undefined;

  constructor(
    private analyticsService: AnalyticsService
  ) {
    this._arrayFeedbackModel = [];
    this._booleanIsLoading = true;
    this._stringErrorText = 'Error fetching feedbacks';
  }

  ngOnInit(): void {
    this.getTotalRecords();
    this.items = [
            { label: 'Feedback Analytics' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  /**
   * Mengambil total jumlah feedback dari backend.
   */
  private getTotalRecords(): void {
    this.analyticsService.getTotalFeedbacks().subscribe({
      next: (total) => {
        this._numberTotalRecords = total;
        console.log('Total Feedbacks:', this._numberTotalRecords);
      },
      error: (error) => {
        console.error('Error fetching total feedbacks:', error);
        this._numberTotalRecords = 0; // Setel ke 0 jika ada error
      },
    });
  }

  /**
   * Metode ini dipanggil oleh p-table ketika ada perubahan paginasi, sorting, atau filtering.
   * Kita akan menggunakan event ini untuk mengambil data yang relevan dari backend.
   * @param event LazyLoadEvent dari PrimeNG
   */
  public onLazyLoad(event: any): void {
    this._booleanIsLoading = true;
    // Dapatkan offset dan limit dari event
    const offset = event.first ?? 0;
    const limit = event.rows ?? this._numberRows;

    this.analyticsService.getFeedbacks(offset, limit).subscribe({
      next: (data) => {
        this._arrayFeedbackModel = data; // Data untuk halaman saat ini
        this._booleanIsLoading = false;
        console.log('Displayed Feedback Data:', this._arrayFeedbackModel);
      },
      error: (error) => {
        console.error(this._stringErrorText, error);
        this._booleanIsLoading = false;
        this._arrayFeedbackModel = [];
        // Jangan reset _numberTotalRecords di sini, karena itu global
      }
    });
  }
}