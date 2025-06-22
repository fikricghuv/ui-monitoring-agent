// src/app/pages/notfound/notfound.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { ButtonModule } from 'primeng/button'; 
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator'; // Jalur relatif yang benar

@Component({
    selector: 'app-notfound', 
    standalone: true, 
    imports: [
        RouterModule,
        AppFloatingConfigurator, 
        ButtonModule
    ],
    templateUrl: './notfound.component.html', 
    styleUrls: ['./notfound.component.scss'] 
})
export class NotfoundComponent {
}