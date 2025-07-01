import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerInteractionService } from '../services/customer-interaction.service';
import {
  CustomerInteraction,
  PaginatedCustomerInteractionResponse
} from '../models/customer_interaction.model';
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
  ],
  templateUrl: './customer.component.html',
})
export class CustomerInteractionsComponent implements OnInit {
  _listMenuItems: MenuItem[] = [];
  _defaultHomeMenu: MenuItem | undefined;
  _booleanIsLoading: boolean = false;
  _numberRows: number = 10;
  _numberTotalRecords: number = 0;
  _searchQuery: string = '';

  tableData: CustomerInteraction[] = [];
  selectedInteraction: CustomerInteraction | null = null;
  _booleanShowDataDialog: boolean = false;

  constructor(private customerInteractionService: CustomerInteractionService) {}

  ngOnInit(): void {
    this._listMenuItems = [{ label: 'Customer Interactions' }];
    this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.loadCustomerInteractions();
  }

  loadCustomerInteractions(): void {
    this._booleanIsLoading = true;

    this.customerInteractionService.getAllCustomerInteractions(0, this._numberRows).subscribe({
      next: (response: PaginatedCustomerInteractionResponse) => {
        this.tableData = response.data ?? [];
        this._numberTotalRecords = response.total ?? 0;
        this._booleanIsLoading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load interactions:', err);
        this.tableData = [];
        this._booleanIsLoading = false;
      },
    });
  }

  public onLazyLoad(event: any): void {
    this._booleanIsLoading = true;

    const offset = event.first ?? 0;
    const limit = event.rows ?? this._numberRows;

    this.customerInteractionService.getAllCustomerInteractions(offset, limit).subscribe({
      next: (response) => {
        this.tableData = response.data ?? [];
        this._numberTotalRecords = response.total ?? 0;
        this._booleanIsLoading = false;
      },
      error: (error) => {
        console.error('❌ Gagal memuat data:', error);
        this.tableData = [];
        this._booleanIsLoading = false;
      }
    });
  }

  onSelectRow(event: any): void {
    this.selectedInteraction = event.data as CustomerInteraction;
    this._booleanShowDataDialog = true;
  }
}
