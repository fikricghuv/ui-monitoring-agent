import { Component, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service'; // Import AnalyticsService
import { ChatHistoryService } from '../../services/chat-history.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Feedbacks</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalFeedbacks }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-twitch text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">24 new </span>
                <span class="text-muted-color">since last visit</span>  -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Token Usages</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalTokens }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-microchip-ai text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">%52+ </span>
                <span class="text-muted-color">since last week</span> -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Users</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalUsers }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">520 </span>
                <span class="text-muted-color">newly registered</span> -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Chats User</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalChats }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">85 </span>
                <span class="text-muted-color">messages</span> -->
            </div>
        </div>`
})
export class StatsWidget implements OnInit { // Implement OnInit
    totalFeedbacks: number = 0; // Properti untuk menyimpan total feedback
    totalTokens: number = 0; // Properti untuk menyimpan total token
    totalUsers: number = 0; // Properti untuk menyimpan total pengguna
    totalChats: number = 0; // Properti untuk menyimpan total chat

    constructor(
        private analyticsService: AnalyticsService,
        private chatHistoryService: ChatHistoryService) {} // Inject AnalyticsService

    ngOnInit(): void {
        this.getTotalFeedbackCount(); // Panggil metode saat komponen diinisialisasi
        this.getTotalTokens(); // Panggil metode saat komponen diinisialisasi
        this.getTotalChats(); // Panggil metode saat komponen diinisialisasi
        this.getTotalUsers(); // Panggil metode saat komponen diinisialisasi
    }

    private getTotalFeedbackCount(): void {
        this.analyticsService.getTotalFeedbacks().subscribe({
            next: (count: number) => {
                this.totalFeedbacks = count; // Update properti totalFeedbacks dengan data dari service
            },
            error: (err) => {
                console.error('Error fetching total feedbacks:', err);
            }
        });
    }

    private getTotalTokens(): void {
        this.chatHistoryService.getTotalTokens().subscribe({
            next: (count: number) => {
                this.totalTokens = count; 
            },
            error: (err) => {
                console.error('Error fetching total tokens:', err);
            }
        });
    }

    public getTotalUsers(): void {
        this.chatHistoryService.getTotalUsers().subscribe({
            next: (count: number) => {
                this.totalUsers = count; // Update properti totalUsers dengan data dari service
            },
            error: (err) => {
                console.error('Error fetching total users:', err);
            }
        });
    }

    public getTotalChats(): void {
        this.chatHistoryService.getTotalChats().subscribe({
            next: (count: number) => {
                this.totalChats = count; // Update properti totalChats dengan data dari service
            },
            error: (err) => {
                console.error('Error fetching total chats:', err);
            }
        });
    }
}
