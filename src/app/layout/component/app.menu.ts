import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Menu',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Realtime Monitoring', icon: 'pi pi-fw pi-desktop', routerLink: ['/pages/monitoring'] },
                    { label: 'Prompt Editor', icon: 'pi pi-fw pi-list', routerLink: ['/pages/editor'] },
                    { label: 'Base Knowledge', icon: 'pi pi-fw pi-book', routerLink: ['/pages/base-knowledge'] },
                    { label: 'Playground', icon: 'pi pi-fw pi-comment', routerLink: ['/pages/playground'] },
                    // { label: 'Admin Chat', icon: 'pi pi-fw pi-comments', routerLink: ['/pages/chat'] },
                    { label: 'Admin Chat', icon: 'pi pi-fw pi-comments', routerLink: ['/pages/admin-chat'] },
                    { label: 'Feedback Analitycs', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/pages/feedback'] }
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
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/fikricghuv/ui-monitoring-agent',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
