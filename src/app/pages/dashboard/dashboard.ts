import { Component, OnInit } from '@angular/core';
// import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
// import { RecentSalesWidget } from './components/recentsaleswidget';
import { MostQuestionsWidget } from './components/mostquestionwidget';
import { AgentPerformanceWidget } from './components/agentperformancewidget';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, MostQuestionsWidget, AgentPerformanceWidget, BreadcrumbModule],
    template: `
        <div class="card flex" style="padding: 0; ">
            <p-breadcrumb class="max-w-full" [style]="{'border-radius': '6px'}" [model]="items" [home]="home" />
        </div>  
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                 <app-agent-performance-widget />
                <!-- <app-recent-sales-widget /> -->
                
            </div>
            <div class="col-span-12 xl:col-span-6">
               <app-most-question-widget />
                <!-- <app-notifications-widget /> -->
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
