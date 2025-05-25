import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { DocumentationComponent } from './app/pages/documentation/documentation.component';
import { NotfoundComponent } from './app/pages/notfound/notfound.component';
import { LoginComponent } from './app/pages/login/login.component';
import { SettingsComponent } from './app/pages/settings/settings.component';
import { ProfileComponent } from './app/pages/profile/profile.component';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent }, // Login kini rute independen

    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Setelah login, redirect ke dashboard
            { path: 'dashboard', component: Dashboard },
            { path: 'documentation', component: DocumentationComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'notfound', component: NotfoundComponent },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
