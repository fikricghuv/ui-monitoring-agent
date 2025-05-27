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
    template: `
        <div class="card flex" style="padding: 0; ">
            <p-breadcrumb class="max-w-full" [style]="{'border-radius': '6px'}" [model]="items" [home]="home" />
        </div>  

        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12">
                <app-agent-performance-widget />
            </div>
        </div>

        <div class="grid grid-cols-12 gap-8 mt-6" style="margin-top: 0px;">
            <app-stats-widget class="contents" />
            
            <div class="col-span-12 xl:col-span-6">
                <app-latency-agent-widget />
            </div>

            <div class="col-span-12 xl:col-span-6">
                <app-most-question-widget />
                
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    items: MenuItem[] | undefined;

    home: MenuItem | undefined;

    ngOnInit() {
        this.items = [
            { label: 'Dashboard' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/' };
    }
}
