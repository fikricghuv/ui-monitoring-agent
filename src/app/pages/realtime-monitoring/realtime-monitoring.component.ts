import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../services/monitoring.service';
import { DashboardService } from '../services/dashboard.service'; 
import { ChatHistoryResponseModel, PaginatedChatHistoryResponse } from '../models/chat_history_response.model';
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
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

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
  public _arrayChatHistoryModel: ChatHistoryResponseModel[] = [];
  public _booleanIsLoading: boolean;
  public _stringSelectedFilter: String;

  public _numberRows: number = 10;
  public _numberTotalRecords: number = 0;
  public _currentPageState: PaginatorState = { first: 0, rows: 10 }; 

  public _listMenuItems: MenuItem[] | undefined;
  public _defaultHomeMenu: MenuItem | undefined;

  public _selectedChat: ChatHistoryResponseModel | null = null;
  public _booleanShowDialog: boolean = false;

  public _searchQuery: string = ''; 

  public _searchSubject = new Subject<string>();
  public _searchSubscription!: Subscription;



  constructor(
    private monitoringService: MonitoringService,
    private dashboardService: DashboardService
  ) {
    this._arrayChatHistoryModel = [];
    this._booleanIsLoading = true;
    this._stringSelectedFilter = 'All Runs';
    this._stringActiveTab = 'Runs';
  }

  ngOnInit() {
    
    this.getTotalRecords();

    this.onLazyLoad(this._currentPageState); 

    this._listMenuItems = [
            { label: 'Realtime Monitoring' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
    
    this._searchSubscription = this._searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.length === 0 || query.length >= 3)
    ).subscribe(() => {
      this._currentPageState.first = 0; 
      this.onLazyLoad(this._currentPageState);
    });
  }

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

  public onSearchChange(query: string): void {
    this._searchQuery = query;
    this._searchSubject.next(query);
  }


  public setFilter(filter: string) {
    this._stringSelectedFilter = filter;
  }

  public setActiveTab(tab: string) {
    this._stringActiveTab = tab;
  }

  public onLazyLoad(event: any) {
    this._currentPageState = event;
    this._booleanIsLoading = true;

    const offset = event.first ?? 0;
    const limit = event.rows ?? this._numberRows;
    const search = this._searchQuery;

    this.monitoringService.getChatHistory(offset, limit, search).subscribe({
      next: (response) => {
        this._arrayChatHistoryModel = response.data;
        this._numberTotalRecords = response.total;
        this._booleanIsLoading = false;
      },
      error: () => {
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

  public onRefreshData(): void {
    console.log('Refresh button clicked!');

    this.onLazyLoad(this._currentPageState); 

    this.getTotalRecords();
  }

  ngOnDestroy(): void {
    this._searchSubscription?.unsubscribe();
  }

}