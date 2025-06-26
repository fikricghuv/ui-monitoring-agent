import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { FeedbackModel } from '../models/feedback.model';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-feedback-analytics',
  standalone: true,
  imports: [CommonModule, PaginatorModule, 
    IconFieldModule, InputIconModule, TableModule, BreadcrumbModule, 
    DialogModule, ButtonModule, FormsModule, CardModule, InputTextModule, DividerModule],
  templateUrl: './feedback-analytics.component.html',
  styleUrl: './feedback-analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  public _arrayFeedbackModel: Array<FeedbackModel>; 
  public _booleanIsLoading: boolean;
  public _stringErrorText: string;

  public _numberFirst: number = 0; 
  public _numberRows: number = 10; 
  public _numberTotalRecords: number = 0; 
  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;

  public _selectedFeedback: any = null;
  public _booleanShowFeedbackDialog: boolean = false;

  public _searchQuery: string = ''; 

  constructor(
    private analyticsService: AnalyticsService
  ) {
    this._arrayFeedbackModel = [];
    this._booleanIsLoading = true;
    this._stringErrorText = 'Error fetching feedbacks';
  }

  ngOnInit(): void {
    this.getTotalRecords();

    this._listMenuItems = [
            { label: 'Feedback Analytics' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
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
        
        this._numberTotalRecords = 0; 
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

    const offset = event.first ?? 0;

    const limit = event.rows ?? this._numberRows;

    this.analyticsService.getFeedbacks(offset, limit).subscribe({
      next: (data) => {
        this._arrayFeedbackModel = data; 

        this._booleanIsLoading = false;
        
        console.log('Displayed Feedback Data:', this._arrayFeedbackModel);
      },
      error: (error) => {
        console.error(this._stringErrorText, error);
        
        this._booleanIsLoading = false;
        
        this._arrayFeedbackModel = [];
        
      }
    });
  }

  public onSelectFeedback(event: any) {

    this._selectedFeedback = event.data;
    
    this._booleanShowFeedbackDialog = true;
  }

}