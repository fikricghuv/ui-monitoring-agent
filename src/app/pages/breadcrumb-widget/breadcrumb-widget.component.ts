import { Component } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb-widget',
  imports: [BreadcrumbModule],
  templateUrl: './breadcrumb-widget.component.html',
  styleUrl: './breadcrumb-widget.component.scss'
})
export class BreadcrumbWidgetComponent {
  breadcrumbHome = { icon: 'pi pi-home', to: '/dashboard' };
  breadcrumbItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
}


