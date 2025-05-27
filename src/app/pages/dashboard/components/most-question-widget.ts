import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DashboardService } from '../../services/dashboard.service';

export interface ProcessedCategoryFrequency {
    category: string;
    percentage: number;
    color: string;
    originalCount: number;
}

@Component({
    standalone: true,
    selector: 'app-most-question-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    templateUrl: './most-question-widget.html',
})
export class MostQuestionsWidget implements OnInit {
    menu = null;
    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    mostAskedCategories: ProcessedCategoryFrequency[] = [];
    isLoading: boolean = true;
    errorMessage: string | null = null;
    menuItems: any[] = [];

    private availableColors = ['orange', 'cyan', 'pink', 'green', 'purple', 'teal', 'indigo', 'red', 'yellow', 'blue'];

    colorClassMap: { [key: string]: string } = {
        orange: 'bg-orange-500',
        cyan: 'bg-cyan-500',
        pink: 'bg-pink-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        teal: 'bg-teal-500',
        indigo: 'bg-indigo-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500'
    };

    textColorClassMap: { [key: string]: string } = {
        orange: 'text-orange-500',
        cyan: 'text-cyan-500',
        pink: 'text-pink-500',
        green: 'text-green-500',
        purple: 'text-purple-500',
        teal: 'text-teal-500',
        indigo: 'text-indigo-500',
        red: 'text-red-500',
        yellow: 'text-yellow-500',
        blue: 'text-blue-500'
    };

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.loadCategoryFrequencies();
        this.menuItems = [
            { label: 'Refresh', icon: 'pi pi-refresh' },
            { label: 'Export', icon: 'pi pi-upload' }
        ];
    }

    capitalizeFirstLetter(str: string): string {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    loadCategoryFrequencies(): void {
        this.isLoading = true;
        this.errorMessage = null;
        this.dashboardService.getCategoriesFrequency().subscribe({
            next: (dataFromService: any[]) => {
                if (!dataFromService || dataFromService.length === 0) {
                    this.mostAskedCategories = [];
                    this.isLoading = false;
                    return;
                }

                const rawData = dataFromService as Array<{ category: string; count: number }>;
                const totalCount = rawData.reduce((sum, item) => sum + item.count, 0);

                this.mostAskedCategories = rawData
                    .sort((a, b) => b.count - a.count)
                    .map((item, index) => {
                        const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                        return {
                            category: this.capitalizeFirstLetter(item.category),
                            originalCount: item.count,
                            percentage,
                            color: this.availableColors[index % this.availableColors.length]
                        };
                    });

                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error fetching category frequencies:", err);
                this.errorMessage = "Failed to load data. " + (err.message || "Please try again later.");
                this.mostAskedCategories = [];
                this.isLoading = false;
            }
        });
    }

    getProgressBarClass(color: string): string {
        return this.colorClassMap[color] || 'bg-orange-500';
    }

    getTextColorClass(color: string): string {
        return this.textColorClassMap[color] || 'text-orange-500';
    }
}
