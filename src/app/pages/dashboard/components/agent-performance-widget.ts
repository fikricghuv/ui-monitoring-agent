import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';

import { DashboardService } from '../../services/dashboard.service';

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
        private conversationStatsService: DashboardService
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

        let dataObservable;

        switch (this.selectedTime) {
            case 'Weekly':
                dataObservable = this.conversationStatsService.getWeeklyTotalConversations();
                break;
            case 'Monthly':
                dataObservable = this.conversationStatsService.getMonthlyTotalConversations();
                break;
            case 'Yearly':
                dataObservable = this.conversationStatsService.getYearlyTotalConversations();
                break;
            default:
                this.errorMessage = "Invalid time selection.";
                this.isLoading = false;
                return;
        }

        dataObservable.pipe(takeUntil(this.destroy$)).subscribe({
            next: (conversationData: { [key: string]: number }) => {
                const labels = Object.keys(conversationData).sort();
                const totalInteractionsData = labels.map(key => conversationData[key]);

                const successfulResolutionsData = labels.map(() => 0); // Semua 0
                const escalationsData = labels.map(() => 0); // Semua 0

                const documentStyle = getComputedStyles(document.documentElement);
                const primary200 = documentStyle.getPropertyValue('--p-primary-200');
                const primary300 = documentStyle.getPropertyValue('--p-primary-300');
                const primary400 = documentStyle.getPropertyValue('--p-primary-400');

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
                            data: successfulResolutionsData,
                            barThickness: 32
                        },
                        {
                            type: 'bar',
                            label: 'Escalations',
                            backgroundColor: primary200,
                            data: escalationsData,
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
