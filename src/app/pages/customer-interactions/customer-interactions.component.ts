import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerModel } from '../models/customer.model';
import { CustomerInteractionService } from '../services/customer-interaction.service';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CustomerInteraction } from '../models/customer_interaction.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-customer-interactions',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    BreadcrumbModule,
    DialogModule,
    TagModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    DividerModule,
    ToastModule,
    PaginatorModule
  ],
  templateUrl: './customer-interactions.component.html',
  providers: [MessageService]
})
export class CustomerInteractionsComponent implements OnInit {
  _listMenuItems: MenuItem[] = [];
  _defaultHomeMenu: MenuItem | undefined;
  _booleanIsLoading: boolean = false;
  _numberRows: number = 10;
  _numberTotalRecords: number = 0;
  _currentPageState: PaginatorState = { first: 0, rows: 10 }; 
  _searchQuery: string = '';

  tableData: CustomerInteraction[] = [];
  selectedInteraction: CustomerInteraction | null = null;
  _booleanShowDataDialog: boolean = false;

  _searchSubject = new Subject<string>();

  constructor(
    private customerInteractionService: CustomerInteractionService,
    private messageService: MessageService) {}

  ngOnInit(): void {
    this._listMenuItems = [{ label: 'Customer Interactions' }];
    this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.onLazyLoad(this._currentPageState);

    this._searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.length === 0 || query.length >= 3)
    ).subscribe(query => {
      this.onLazyLoad(this._currentPageState);
    });
  }

  public onLazyLoad(event: any): void {
    this._currentPageState = event;
    this._booleanIsLoading = true;

    const offset = event.first ?? 0;
    const limit = event.rows ?? this._numberRows;
    const query = this._searchQuery.trim();

    this.customerInteractionService
    .getAllCustomerInteractions(offset, limit, query)
    .subscribe({
      next: (response) => {
        this.tableData = response.data ?? [];
        this._numberTotalRecords = response.total ?? 0;
        this._booleanIsLoading = false;
      },
      error: (error) => {
        console.error('❌ Gagal memuat data customer interactions:', error);
        this.tableData = [];
        this._booleanIsLoading = false;
      }
    });

  }

  public onRefreshData(): void {
    this.onLazyLoad(this._currentPageState);

    this.messageService.add({
        severity: 'success',
        summary: 'Refreshed',
        detail: 'Data has been refreshed.'
    });
  }

  onSelectRow(event: any): void {
    this.selectedInteraction = event.data as CustomerInteraction;
    this._booleanShowDataDialog = true;
  }
}
