// src/app/services/error-handling.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorMessageSubject = new Subject<{ code: string, detail: string }>();

  errorMessage$ = this.errorMessageSubject.asObservable();

  constructor() { }

  showError(code: string, detail: string): void {
    this.errorMessageSubject.next({ code, detail });
  }
}