import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { DocumentationComponent } from './app/pages/documentation/documentation.component';
import { NotfoundComponent } from './app/pages/notfound/notfound.component';
import { LoginComponent } from './app/pages/login/login.component';
import { SettingsComponent } from './app/pages/settings/settings.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { NotificationComponent } from './app/pages/notification/notification.component';

export const appRoutes: Routes = [
    { path: '', component: LoginComponent }, 
    { path: 'login', component: LoginComponent }, 
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'documentation', component: DocumentationComponent },
            // { path: 'settings', component: SettingsComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'notification', component: NotificationComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'notfound', component: NotfoundComponent },
    { path: '**', redirectTo: '/notfound' }
];
