import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerModel } from '../models/customer.model';
import { CustomerService } from '../services/customer_profile.service';
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

@Component({
  selector: 'app-customer-profiles',
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
    PaginatorModule
  ],
  templateUrl: './customer.component.html',
})
export class CustomerProfilesComponent implements OnInit {
  _listMenuItems: MenuItem[] = [];
  _defaultHomeMenu: MenuItem | undefined;
  _booleanIsLoading: boolean = false;
  _numberRows: number = 10;
  _numberTotalRecords: number = 0;
  _currentPageState: PaginatorState = { first: 0, rows: 10 }; 
  _searchQuery: string = '';

  tableData: CustomerModel[] = [];
  selectedCustomer: CustomerModel | null = null;
  _booleanShowDataDialog: boolean = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this._listMenuItems = [{ label: 'Customer Profiles' }];
    this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.onLazyLoad(this._currentPageState);
  }

  public onLazyLoad(event: any): void {
    this._currentPageState = event;
    this._booleanIsLoading = true;

    const offset = event.first ?? 0;
    const limit = event.rows ?? this._numberRows;

    this.customerService.getAllCustomers(limit, offset).subscribe({
      next: (response) => {
        this.tableData = response.data ?? [];
        this._numberTotalRecords = response.total ?? 0;
        this._booleanIsLoading = false;
      },
      error: (error) => {
        console.error('❌ Gagal memuat data customer:', error);
        this.tableData = [];
        this._booleanIsLoading = false;
      }
    });
  }

  public onRefreshData(): void {
    this.onLazyLoad(this._currentPageState);
  }

  onSelectRow(event: any): void {
    this.selectedCustomer = event.data as CustomerModel;
    this._booleanShowDataDialog = true;
  }
}
