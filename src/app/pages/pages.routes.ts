import { Routes } from '@angular/router';
import { DocumentationComponent } from './documentation/documentation.component';
import { RealtimeMonitoringComponent } from './realtime-monitoring/realtime-monitoring.component';
import { PromptEditorComponent } from './prompt-editor/prompt-editor.component';
import { BaseKnowledgeComponent } from './base-knowledge/base-knowledge.component';
import { PlaygroundComponent } from './playground/playground.component';
import { AnalyticsComponent } from './feedback-analytics/feedback-analytics.component';
import { Dashboard } from './dashboard/dashboard';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';

export default [
    { path: 'Dashboard', component: Dashboard },
    { path: 'monitoring', component: RealtimeMonitoringComponent },
    { path: 'editor', component: PromptEditorComponent },
    { path: 'base-knowledge', component: BaseKnowledgeComponent},
    { path: 'playground', component: PlaygroundComponent},
    { path: 'admin-chat', component: AdminChatComponent},
    { path: 'feedback', component: AnalyticsComponent},
    { path: 'settings', component: SettingsComponent},
    { path: 'profile', component: ProfileComponent},
    { path: 'documentation', component: DocumentationComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
