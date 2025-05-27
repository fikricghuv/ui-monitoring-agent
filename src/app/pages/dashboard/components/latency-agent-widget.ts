import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { MenuItem } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-latency-agent-widget',
  imports: [
    ButtonModule,
    MenuModule,
    ChartModule,
    SelectButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './latency-agent-widget.html'
})
export class LatencyAgentWidget implements OnInit, OnDestroy {
  items = [
    { label: 'Refresh Data', icon: 'pi pi-refresh' },
    { label: 'View Details', icon: 'pi pi-chart-line' }
  ];

  chartData: any;
  chartOptions: any;

  selectedView: string = 'Daily';

  viewOptions: { label: string; value: string }[] = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Monthly', value: 'Monthly' }
  ];

  menuItems: MenuItem[] = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.selectedView = 'Daily'; // Pastikan default terset
    this.loadLatencyData();
    this.setChartOptions();

    this.menuItems = [
      {
        label: 'Refresh',
        icon: 'pi pi-refresh',
        command: () => this.loadLatencyData()
      },
      {
        label: 'Export',
        icon: 'pi pi-upload',
        command: () => console.log('Export data (implementasi di sini)')
      }
    ];
  }

  onViewChange() {
    console.log('View changed to:', this.selectedView);
    this.loadLatencyData();
  }

  loadLatencyData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.chartData = null;

    const dataObservable = this.selectedView === 'Daily'
      ? this.dashboardService.getDailyAverageLatency()
      : this.dashboardService.getMonthlyAverageLatency();

    dataObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: { [key: string]: number }) => {
        if (!data || Object.keys(data).length === 0) {
          this.chartData = {
            labels: [],
            datasets: []
          };
          this.isLoading = false;
          return;
        }

        const sortedKeys = Object.keys(data).sort();
        const lastFiveKeys = sortedKeys.slice(-5);

        const labels = lastFiveKeys;
        const dataValues = lastFiveKeys.map(key => data[key]);

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Average Latency (ms)',
              data: dataValues,
              fill: false,
              borderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
              tension: 0.4,
              pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
              pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
              pointHoverBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
              pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
              backgroundColor: 'rgba(0, 123, 255, 0.2)'
            }
          ]
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching latency data:', err);
        this.errorMessage = 'Failed to load latency data. ' + (err.message || 'Please try again later.');
        this.isLoading = false;
        this.chartData = null;
      }
    });
  }

  setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            stepSize: 100
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          },
          beginAtZero: true
        }
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
