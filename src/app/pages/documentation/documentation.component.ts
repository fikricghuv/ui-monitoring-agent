// src/app/components/documentation/documentation.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './documentation.component.html', // Mengarahkan ke file HTML terpisah
    styleUrls: ['./documentation.component.scss']  // Mengarahkan ke file SCSS terpisah
})
export class DocumentationComponent {
  
}