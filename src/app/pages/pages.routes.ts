import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { RealtimeMonitoringComponent } from './realtime-monitoring/realtime-monitoring.component';
import { PromptEditorComponent } from './prompt-editor/prompt-editor.component';
import { BaseKnowledgeComponent } from './base-knowledge/base-knowledge.component';
import { PlaygroundComponent } from './playground/playground.component';
import { ChatComponent } from './chat/chat.component';
import { AnalyticsComponent } from './feedback-analytics/feedback-analytics.component';
import { Dashboard } from './dashboard/dashboard';
import { AdminChatComponent } from './admin-chat/admin-chat.component';

export default [
    { path: 'Dashboard', component: Dashboard },
    { path: 'monitoring', component: RealtimeMonitoringComponent },
    { path: 'editor', component: PromptEditorComponent },
    { path: 'base-knowledge', component: BaseKnowledgeComponent},
    { path: 'playground', component: PlaygroundComponent},
    { path: 'chat', component: ChatComponent},
    { path: 'admin-chat', component: AdminChatComponent},
    { path: 'feedback', component: AnalyticsComponent},
    
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
