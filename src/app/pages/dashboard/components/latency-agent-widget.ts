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
import { Router } from '@angular/router';

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
  _listItems = [
    { label: 'Refresh Data', icon: 'pi pi-refresh' },
    { label: 'View Details', icon: 'pi pi-chart-line' }
  ];

  _anyChartData: any;
  _anyChartOptions: any;

  _stringSelectedView: string = 'Daily';

  _listViewOptions: { label: string; value: string }[] = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Monthly', value: 'Monthly' }
  ];

  _listMenuItems: MenuItem[] = [];

  _boolIsLoading: boolean = true;
  _stringErrorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private router: Router) {}

  ngOnInit() {
    this._stringSelectedView = 'Daily'; 
    this.loadLatencyData();
    this.setChartOptions(); 

    this._listMenuItems = [
      {
        label: 'Refresh',
        icon: 'pi pi-refresh',
        command: () => this.loadLatencyData()
      },
      {
        label: 'Export',
        icon: 'pi pi-upload',
        routerLink: '/pages/report'
      }
    ];
  }

  onViewChange() {
    console.log('View changed to:', this._stringSelectedView);
    this.loadLatencyData();
    this.setChartOptions(); 
  }

  loadLatencyData(): void {
    this._boolIsLoading = true;
    this._stringErrorMessage = null;
    this._anyChartData = null;

    const dataObservable = this._stringSelectedView === 'Daily'
      ? this.dashboardService.getDailyAverageLatency()
      : this.dashboardService.getMonthlyAverageLatency();

    dataObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: { [key: string]: number }) => {
        if (!data || Object.keys(data).length === 0) {
          this._anyChartData = {
            labels: [],
            datasets: []
          };
          this._boolIsLoading = false;
          return;
        }

        const sortedKeys = Object.keys(data).sort();
        
        const lastFiveKeys = sortedKeys.slice(-5);

        const labels = lastFiveKeys;
        
        const dataValuesInSeconds = lastFiveKeys.map(key => data[key] / 1000);

        this._anyChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Average Latency (seconds)',
              data: dataValuesInSeconds, 
              fill: true,
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
        this._boolIsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching latency data:', err);
        this._stringErrorMessage = 'Failed to load latency data. ' + (err.message || 'Please try again later.');
        this._boolIsLoading = false;
        this._anyChartData = null;
      }
    });
  }

  setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this._anyChartOptions = {
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
            stepSize: 0.5, 
            callback: function(value: any) { 
              return value + 's';
            }
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