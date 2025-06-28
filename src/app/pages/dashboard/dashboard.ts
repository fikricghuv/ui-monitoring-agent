import { Component, OnInit } from '@angular/core';
import { LatencyAgentWidget } from './components/latency-agent-widget';
import { StatsWidget } from './components/stats-widget';
import { MostQuestionsWidget } from './components/most-question-widget';
import { AgentPerformanceWidget } from './components/agent-performance-widget';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, MostQuestionsWidget, AgentPerformanceWidget, BreadcrumbModule, LatencyAgentWidget],
    templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
    _listIems: MenuItem[] | undefined;

    _selectedMenuHome: MenuItem | undefined;

    ngOnInit() {
        this._listIems = [
            { label: 'Dashboard' }
        ];

        this._selectedMenuHome = { icon: 'pi pi-home', routerLink: '/dashboard' };
    }
}
