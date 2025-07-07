// auth.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;
  
  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    const headers = new HttpHeaders({
          'X-API-Key': this.apiKey, 
        });
    return this.http.get<User>(`${this.apiUrl}/auth/me`, { headers: headers });
         
  }
}
