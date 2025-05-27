import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subject, takeUntil, forkJoin } from 'rxjs'; // Pastikan forkJoin diimpor
import { LayoutService } from '../../../layout/service/layout.service';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';

import { DashboardService } from '../../services/dashboard.service'; // Pastikan path ini benar

@Component({
    standalone: true,
    selector: 'app-agent-performance-widget',
    imports: [
        ChartModule,
        MenuModule,
        ButtonModule,
        CalendarModule,
        SelectButtonModule,
        CommonModule,
        FormsModule
    ],
    templateUrl: './agent-performance-widget.html',
})
export class AgentPerformanceWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    menuItems: MenuItem[] = [];

    dates: Date[] | undefined = [];
    selectedTime: string = 'Weekly';
    timeOptions = [
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Yearly', value: 'Yearly' }
    ];

    isLoading = true;
    errorMessage: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService
    ) {}

    ngOnInit() {
        this.menuItems = [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh',
                command: () => this.loadChartData()
            },
            {
                label: 'Export',
                icon: 'pi pi-upload',
                command: () => console.log('Export data (implementasi di sini)')
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
        this.isLoading = true;
        this.errorMessage = null;
        this.chartData = null;

        let totalConversationsObservable;
        let totalEscalationsObservable;

        switch (this.selectedTime) {
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
                this.errorMessage = "Invalid time selection.";
                this.isLoading = false;
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
                    if (this.selectedTime === 'Monthly') {
                        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
                    } else if (this.selectedTime === 'Weekly') {
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

                this.chartData = {
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

                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error fetching agent performance data:", err);
                this.errorMessage = "Failed to load performance data. " + (err.message || "Please try again later.");
                this.isLoading = false;
                this.chartData = { labels: [], datasets: [] };
            }
        });
    }

    setChartOptions() {
        const documentStyle = getComputedStyles(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartOptions = {
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