import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { ChatHistoryService } from '../../services/chat-history.service';
import { DashboardService } from '../../services/dashboard.service'; // Import DashboardService

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    templateUrl: './stats-widget.html',
})
export class StatsWidget implements OnInit {
    _numberTotalFeedbacks: number = 0;
    _numberTotalTokens: number = 0;
    _numberTotalUsers: number = 0;
    _numberTotalChats: number = 0;

    // Properti baru untuk menyimpan data bulanan
    _numberMonthlyNewUsers: number = 0;
    _numberMonthlyConversations: number = 0;
    _numberMonthlyEscalations: number = 0;
    _numberMonthlyTokensUsage: number = 0; 

    constructor(
        private analyticsService: AnalyticsService,
        private chatHistoryService: ChatHistoryService,
        private dashboardService: DashboardService
    ) {}

    ngOnInit(): void {
        // Panggil metode untuk mendapatkan total kumulatif
        this.getTotalFeedbackCount();
        this.getTotalTokens();
        this.getTotalChats();
        this.getTotalUsers();

        // Panggil metode untuk mendapatkan statistik bulanan
        this.getMonthlyNewUsers();
        this.getMonthlyConversations();
        this.getMonthlyEscalations();
        this.getMonthlyTokensUsage();
    }

    private getTotalFeedbackCount(): void {
        this.analyticsService.getTotalFeedbacks().subscribe({
            next: (count: number) => {
                this._numberTotalFeedbacks = count;
            },
            error: (err) => {
                console.error('Error fetching total feedbacks:', err);
            }
        });
    }

    private getTotalTokens(): void {
        this.chatHistoryService.getTotalTokens().subscribe({
            next: (count: number) => {
                this._numberTotalTokens = count;
            },
            error: (err) => {
                console.error('Error fetching total tokens:', err);
            }
        });
    }

    public getTotalUsers(): void {
        this.chatHistoryService.getTotalUsers().subscribe({
            next: (count: number) => {
                this._numberTotalUsers = count;
            },
            error: (err) => {
                console.error('Error fetching total users:', err);
            }
        });
    }

    public getTotalChats(): void {
        this.chatHistoryService.getTotalChats().subscribe({
            next: (count: number) => {
                this._numberTotalChats = count;
            },
            error: (err) => {
                console.error('Error fetching total chats:', err);
            }
        });
    }

    /**
     * Mengambil data penambahan user baru setiap bulan dan memperbarui monthlyNewUsers.
     */
    private getMonthlyNewUsers(): void {
        this.dashboardService.getMonthlyNewUsers().subscribe({
            next: (data: { [key: string]: number }) => {
                this._numberMonthlyNewUsers = this.getLatestMonthValue(data);
            },
            error: (err) => {
                console.error('Error fetching monthly new users:', err);
            }
        });
    }

    /**
     * Mengambil data total percakapan bulanan dan memperbarui monthlyConversations.
     */
    private getMonthlyConversations(): void {
        this.dashboardService.getMonthlyConversations().subscribe({
            next: (data: { [key: string]: number }) => {
                this._numberMonthlyConversations = this.getLatestMonthValue(data);
            },
            error: (err) => {
                console.error('Error fetching monthly conversations:', err);
            }
        });
    }

    /**
     * Mengambil data total eskalasi bulanan (feedback) dan memperbarui monthlyEscalations.
     */
    private getMonthlyEscalations(): void {
        this.dashboardService.getMonthlyEscalations().subscribe({
            next: (data: { [key: string]: number }) => {
                this._numberMonthlyEscalations = this.getLatestMonthValue(data);
            },
            error: (err) => {
                console.error('Error fetching monthly escalations:', err);
            }
        });
    }

    private getMonthlyTokensUsage(): void {
        this.dashboardService.getMonthlyTokensUsage().subscribe({
            next: (data: { [key: string]: number }) => {
                this._numberMonthlyTokensUsage = this.getLatestMonthValue(data);
            },
            error: (err) => {
                console.error('Error fetching monthly tokens usage:', err);
            }
        });
    }

    /**
     * Fungsi helper untuk mendapatkan nilai dari bulan terbaru dari objek dictionary.
     * Diasumsikan kunci (keys) dalam format 'YYYY-MM' dan dapat diurutkan secara leksikografis.
     * @param data Objek dictionary yang berisi data bulanan.
     * @returns Nilai untuk bulan terbaru, atau 0 jika tidak ada data.
     */
    private getLatestMonthValue(data: { [key: string]: number }): number {
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return 0;
        }
        // Urutkan kunci untuk memastikan kita mendapatkan bulan terbaru
        keys.sort();
        const latestMonthKey = keys[keys.length - 1];
        return data[latestMonthKey];
    }
}
