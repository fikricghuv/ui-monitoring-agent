import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';

interface UserProfileData {
    id: number;
    name: string;
    phone_number: string;
    email_address: string;
    registration_date: Date; 
    last_chat_date: Date;    
    status: string;          
}

@Component({
    selector: 'customer-app',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ChartModule,
        FormsModule,
        DividerModule,
        AvatarModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        ButtonModule,
        TableModule,
        InputTextModule,
        TagModule,
        OverlayBadgeModule,
        DrawerModule,
        ToggleSwitchModule,
        PopoverModule,
        BreadcrumbModule,
        CardModule,
        DialogModule
    ],
    templateUrl: './customer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit { 

    public _listMenuItems: MenuItem[] | undefined;
    public _defaultHomeMenu: MenuItem | undefined;

    public _selectedData: UserProfileData | null = null; 
    public _booleanShowDataDialog: boolean = false;


    public _searchQuery: string = '';
    tableData: UserProfileData[] = []; 

    selectedRows: UserProfileData[] = []; 

    public _numberFirst: number = 0; 
    public _numberRows: number = 10; 
    public _numberTotalRecords: number = 0;

    public _booleanIsLoading: boolean = false; 

    tableTokens = {
        header: {
            background: 'transparent'
        },
        headerCell: {
            background: 'transparent'
        },
        row: {
            background: 'transparent'
        }
    };

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this._listMenuItems = [
            { label: 'Users Profile' }
        ];

        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };

        // Inisialisasi data dummy untuk tabel
        this.tableData = [
            {
                id: 1,
                name: 'Alice Johnson',
                phone_number: '+6281234567890',
                email_address: 'alice.johnson@example.com',
                registration_date: new Date('2023-01-15T10:00:00Z'),
                last_chat_date: new Date('2024-06-20T14:30:00Z'),
                status: 'Active'
            },
            {
                id: 2,
                name: 'Bob Smith',
                phone_number: '+6287654321098',
                email_address: 'bob.smith@example.com',
                registration_date: new Date('2022-11-20T09:15:00Z'),
                last_chat_date: new Date('2024-06-18T11:00:00Z'),
                status: 'Inactive'
            },
            {
                id: 3,
                name: 'Charlie Brown',
                phone_number: '+6281122334455',
                email_address: 'charlie.brown@example.com',
                registration_date: new Date('2024-03-01T16:45:00Z'),
                last_chat_date: new Date('2024-06-23T08:00:00Z'),
                status: 'Active'
            },
            {
                id: 4,
                name: 'Diana Prince',
                phone_number: '+6285566778899',
                email_address: 'diana.prince@example.com',
                registration_date: new Date('2023-07-05T13:20:00Z'),
                last_chat_date: new Date('2024-06-15T10:10:00Z'),
                status: 'Blocked'
            },
            {
                id: 5,
                name: 'Eve Adams',
                phone_number: '+6289988776655',
                email_address: 'eve.adams@example.com',
                registration_date: new Date('2022-09-10T11:00:00Z'),
                last_chat_date: new Date('2024-06-22T17:00:00Z'),
                status: 'Active'
            },
            {
                id: 6,
                name: 'Frank White',
                phone_number: '+6281212121212',
                email_address: 'frank.white@example.com',
                registration_date: new Date('2024-01-25T08:30:00Z'),
                last_chat_date: new Date('2024-06-19T09:45:00Z'),
                status: 'Active'
            },
            {
                id: 7,
                name: 'Grace Taylor',
                phone_number: '+6287733445566',
                email_address: 'grace.taylor@example.com',
                registration_date: new Date('2023-04-03T14:00:00Z'),
                last_chat_date: new Date('2024-06-17T16:00:00Z'),
                status: 'Inactive'
            },
            {
                id: 8,
                name: 'Harry Potter',
                phone_number: '+6281899001122',
                email_address: 'harry.potter@example.com',
                registration_date: new Date('2022-05-18T10:50:00Z'),
                last_chat_date: new Date('2024-06-21T13:00:00Z'),
                status: 'Active'
            },
            {
                id: 9,
                name: 'Ivy Green',
                phone_number: '+6285234567891',
                email_address: 'ivy.green@example.com',
                registration_date: new Date('2024-02-14T11:11:00Z'),
                last_chat_date: new Date('2024-06-20T10:00:00Z'),
                status: 'Active'
            },
            {
                id: 10,
                name: 'Jack Black',
                phone_number: '+6289876543210',
                email_address: 'jack.black@example.com',
                registration_date: new Date('2023-10-22T07:00:00Z'),
                last_chat_date: new Date('2024-06-16T14:00:00Z'),
                status: 'Inactive'
            },
        ];
    }

    public onSelectFeedback(event: any) {
        // Menggunakan event.data untuk mendapatkan baris yang dipilih
        this._selectedData = event.data as UserProfileData;
        this._booleanShowDataDialog = true;
    }

    displayPopover(event: Event, op: any) {
        op.hide();
        setTimeout(() => {
            op.show(event);
        }, 150);
    }
}