import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../services/monitoring.service';
import { DashboardService } from '../services/dashboard.service'; // <--- Impor DashboardService
import { ChatHistoryResponseModel } from '../models/chat_history_response.model';
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-realtime-monitoring',
  standalone: true,
  imports: [CommonModule, CardModule, PaginatorModule, 
    TableModule, IconFieldModule, InputIconModule, 
    BreadcrumbModule, DialogModule, FormsModule, ButtonModule, 
    InputTextModule, DividerModule],
  templateUrl: './realtime-monitoring.component.html',
  styleUrl: './realtime-monitoring.component.scss',
})
export class RealtimeMonitoringComponent implements OnInit {
  public _stringActiveTab: String;
  public _arrayChatHistoryModel: Array<ChatHistoryResponseModel>;
  public _booleanIsLoading: boolean;
  public _stringSelectedFilter: String;

  public _numberRows: number = 10;
  public _numberTotalRecords: number = 0;

  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;

  public _selectedChat: ChatHistoryResponseModel | null = null;
  public _booleanShowDialog: boolean = false;

  public _searchQuery: string = ''; 


  constructor(
    private monitoringService: MonitoringService,
    private dashboardService: DashboardService // <--- Injeksi DashboardService
  ) {
    this._arrayChatHistoryModel = [];
    this._booleanIsLoading = true;
    this._stringSelectedFilter = 'All Runs';
    this._stringActiveTab = 'Runs';
  }

  ngOnInit() {
    
    this.getTotalRecords();

    this._listMenuItems = [
            { label: 'Realtime Monitoring' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
  }

  // Metode baru untuk mendapatkan total record
  private getTotalRecords(): void {

    this.dashboardService.getTotalConversations().subscribe({
      next: (total) => {

        this._numberTotalRecords = total;

        console.log('Total Conversations:', this._numberTotalRecords);
      },
      error: (error) => {

        console.error('Error fetching total conversations:', error);
        
        this._numberTotalRecords = 0; 
      },
    });
  }

  public setFilter(filter: string) {
    this._stringSelectedFilter = filter;
  }

  public setActiveTab(tab: string) {
    this._stringActiveTab = tab;
  }

  public onLazyLoad(event: any) {

    this._booleanIsLoading = true;

    const first = event.first ?? 0;

    const rows = event.rows ?? this._numberRows;

    const offset = first;

    const limit = rows;

    this.monitoringService.getChatHistory(offset, limit).subscribe({
      next: (data) => {
        this._arrayChatHistoryModel = data; 
        
        this._booleanIsLoading = false;

        console.log('Displayed Data:', this._arrayChatHistoryModel);
      },
      error: (error) => {

        console.error('Error fetching chat history:', error);

        this._booleanIsLoading = false;

        this._arrayChatHistoryModel = [];
      },
    });
  }

  public formatLatency(durationString: string | null | undefined): string {
    if (!durationString || typeof durationString !== 'string') {
      return '-';
    }

    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
    
    const matches = durationString.match(regex);

    if (!matches) {
      console.warn('Could not parse duration string:', durationString);
      return '-';
    }

    const hours = parseInt(matches[1] || '0', 10);

    const minutes = parseInt(matches[2] || '0', 10);

    const seconds = parseFloat(matches[3] || '0');

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (isNaN(totalSeconds)) {

      console.error('Calculated total seconds is NaN for duration:', durationString);
      
      return '-';
    }

    return totalSeconds.toFixed(2) + ' ms';
  }

  public onSelectChat(event: any) {

    this._selectedChat = event.data;

    this._booleanShowDialog = true;
  }

}