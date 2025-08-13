import { Routes } from '@angular/router';
import { DocumentationComponent } from './documentation/documentation.component';
import { RealtimeMonitoringComponent } from './realtime-monitoring/realtime-monitoring.component';
import { PromptEditorComponent } from './prompt-editor/prompt-editor.component';
import { BaseKnowledgeComponent } from './base-knowledge/base-knowledge.component';
// import { PlaygroundComponent } from './playground/playground.component';
import { AnalyticsComponent } from './feedback-analytics/feedback-analytics.component';
import { Dashboard } from './dashboard/dashboard';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
// import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportComponent } from './report/report.component';
import { CustomerProfilesComponent } from './customer/customer.component';
import { NotificationComponent } from './notification/notification.component';
import { CustomerInteractionsComponent } from './customer-interactions/customer-interactions.component';
import { AdminManagementComponent } from './admin-management/admin-management.component'

export default [
    { path: 'dashboard', component: Dashboard },
    { path: 'monitoring', component: RealtimeMonitoringComponent },
    { path: 'editor', component: PromptEditorComponent },
    { path: 'base-knowledge', component: BaseKnowledgeComponent},
    // { path: 'playground', component: PlaygroundComponent},
    { path: 'admin-chat', component: AdminChatComponent},
    { path: 'feedback', component: AnalyticsComponent},
    { path: 'report', component: ReportComponent },
    { path: 'customer', component: CustomerProfilesComponent },
    { path: 'customer-interactions', component: CustomerInteractionsComponent },
    { path: 'admin-management', component: AdminManagementComponent },
    // { path: 'settings', component: SettingsComponent},
    { path: 'profile', component: ProfileComponent},
    { path: 'notification', component:NotificationComponent},
    { path: 'documentation', component: DocumentationComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
