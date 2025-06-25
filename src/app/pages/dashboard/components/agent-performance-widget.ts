import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subject, takeUntil, forkJoin } from 'rxjs'; // Pastikan forkJoin diimpor
import { LayoutService } from '../../../layout/service/layout.service';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { SelectButton } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service'; // Pastikan path ini benar
import { Router } from '@angular/router';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    standalone: true,
    selector: 'app-agent-performance-widget',
    imports: [
        ChartModule,
        MenuModule,
        ButtonModule,
        CalendarModule,
        SelectButton,
        CommonModule,
        FormsModule,
        ToggleButtonModule,
        SelectButtonModule
    ],
    templateUrl: './agent-performance-widget.html',
    styleUrls: ['./agent-performance-widget.scss'],
})
export class AgentPerformanceWidget implements OnInit, OnDestroy {
    
    _anyChartData: any;
    _anyChartOptions: any;
    _listMenuItems: MenuItem[] = [];

    _listDates: Date[] | undefined = [];
    _stringSelectedTime: string = 'Weekly';
    _listTimeOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Yearly', value: 'Yearly' }
    ];

    _boolIsLoading = true;
    _stringErrorMessage: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService,
        private router: Router
    ) {}

    ngOnInit() {
        this._listMenuItems = [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh',
                command: () => this.loadChartData()
            },
            {
                label: 'Export',
                icon: 'pi pi-upload',
                routerLink: '/pages/report'
            }
        ];

        this.layoutService.configUpdate$.pipe(debounceTime(25), takeUntil(this.destroy$)).subscribe(() => {
            this.setChartOptions();
            this.loadChartData();
        });

        this.setChartOptions();
        this.loadChartData();
    }

    onTimeChange() {
        this.loadChartData();
    }

    loadChartData() {
        this._boolIsLoading = true;
        this._stringErrorMessage = null;
        this._anyChartData = null;

        let totalConversationsObservable;
        let totalEscalationsObservable;

        switch (this._stringSelectedTime) {
            case 'Weekly':
                totalConversationsObservable = this.dashboardService.getWeeklyTotalConversations();
                totalEscalationsObservable = this.dashboardService.getWeeklyTotalEscalations();
                break;
            case 'Monthly':
                totalConversationsObservable = this.dashboardService.getMonthlyTotalConversations();
                totalEscalationsObservable = this.dashboardService.getMonthlyTotalEscalations();
                break;
            case 'Yearly':
                totalConversationsObservable = this.dashboardService.getYearlyTotalConversations();
                totalEscalationsObservable = this.dashboardService.getYearlyTotalEscalations();
                break;
            default:
                this._stringErrorMessage = "Invalid time selection.";
                this._boolIsLoading = false;
                return;
        }

        // forkJoin hanya perlu memanggil dua service yang ada
        forkJoin([
            totalConversationsObservable,
            totalEscalationsObservable,
        ]).pipe(takeUntil(this.destroy$)).subscribe({
            next: ([conversationData, escalationData]) => {
                // Gabungkan semua key dari kedua dataset untuk mendapatkan labels yang lengkap
                const allKeys = new Set<string>();
                Object.keys(conversationData).forEach(key => allKeys.add(key));
                Object.keys(escalationData).forEach(key => allKeys.add(key));

                const labels = Array.from(allKeys).sort((a, b) => {
                    // Logika pengurutan khusus untuk bulan/minggu
                    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    if (this._stringSelectedTime === 'Monthly') {
                        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
                    } else if (this._stringSelectedTime === 'Weekly') {
                        const weekNumA = parseInt(a.replace('Week ', ''));
                        const weekNumB = parseInt(b.replace('Week ', ''));
                        return weekNumA - weekNumB;
                    } else {
                        return a.localeCompare(b);
                    }
                });

                // Dapatkan data Total Interactions dan Escalations dari API
                const totalInteractionsData = labels.map(key => conversationData[key] || 0);
                const escalationsChartData = labels.map(key => escalationData[key] || 0);

                // HITUNG Successful Resolutions: Total Interactions - Escalations
                const successfulResolutionsData = labels.map((_, index) => {
                    const interactions = totalInteractionsData[index];
                    const escalations = escalationsChartData[index];
                    // Pastikan hasil tidak negatif
                    return Math.max(0, interactions - escalations);
                });

                const documentStyle = getComputedStyles(document.documentElement);
                const primary200 = documentStyle.getPropertyValue('--p-primary-200'); // Escalations
                const primary300 = documentStyle.getPropertyValue('--p-primary-300'); // Successful Resolutions
                const primary400 = documentStyle.getPropertyValue('--p-primary-400'); // Total Interactions

                this._anyChartData = {
                    labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Total Interactions',
                            backgroundColor: primary400,
                            data: totalInteractionsData,
                            barThickness: 32
                        },
                        {
                            type: 'bar',
                            label: 'Successful Resolutions',
                            backgroundColor: primary300,
                            data: successfulResolutionsData, // Data yang sudah dihitung
                            barThickness: 32
                        },
                        {
                            type: 'bar',
                            label: 'Escalations',
                            backgroundColor: primary200,
                            data: escalationsChartData,
                            borderRadius: {
                                topLeft: 8,
                                topRight: 8,
                                bottomLeft: 0,
                                bottomRight: 0
                            },
                            borderSkipped: false,
                            barThickness: 32
                        }
                    ]
                };

                this._boolIsLoading = false;
            },
            error: (err) => {
                console.error("Error fetching agent performance data:", err);
                this._stringErrorMessage = "Failed to load performance data. " + (err.message || "Please try again later.");
                this._boolIsLoading = false;
                this._anyChartData = { labels: [], datasets: [] };
            }
        });
    }

    setChartOptions() {
        const documentStyle = getComputedStyles(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this._anyChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { color: textMutedColor },
                    grid: { color: 'transparent', borderColor: 'transparent' }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: { color: textMutedColor },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

function getComputedStyles(element: Element) {
    return window.getComputedStyle(element);
}