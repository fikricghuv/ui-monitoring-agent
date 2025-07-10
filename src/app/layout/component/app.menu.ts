import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    templateUrl: './app.menu.html',
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Analytics',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Realtime Monitoring', icon: 'pi pi-fw pi-desktop', routerLink: ['/pages/monitoring'] },
                    { label: 'Feedback Analytics', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/pages/feedback'] },
                    { label: 'Users Profile', icon: 'pi pi-fw pi-users', routerLink: ['/pages/customer'] },
                    { label: 'Users Interactions', icon: 'pi pi-fw pi-list-check', routerLink: ['/pages/customer-interactions'] },
                ]
            },
            {
                label: 'Conversation',
                items: [
                    { label: 'Playground', icon: 'pi pi-fw pi-comment', routerLink: ['/pages/playground'] },
                    { label: 'Admin Chat', icon: 'pi pi-fw pi-comments', routerLink: ['/pages/admin-chat'] },
                ]
            },
            {
                label: 'Reports',
                items: [
                    { label: 'Report', icon: 'pi pi-fw pi-download', routerLink: ['/pages/report'] },
                ]
            },
            {
                label: 'Configuration',
                items: [
                    { label: 'Prompt Editor', icon: 'pi pi-fw pi-list', routerLink: ['/pages/editor'] },
                    { label: 'Base Knowledge', icon: 'pi pi-fw pi-file-plus', routerLink: ['/pages/base-knowledge'] },
                ]
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    // {
                    //     label: 'View Source',
                    //     icon: 'pi pi-fw pi-github',
                    //     url: 'https://github.com/fikricghuv/ui-monitoring-agent',
                    //     target: '_blank'
                    // }
                ]
            }
        ];
    }
}
