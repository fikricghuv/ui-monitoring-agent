import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;
  
  constructor(private http: HttpClient) {}

  /**
   * Mengirim permintaan login ke backend untuk mendapatkan JWT token.
   * @param email Email pengguna
   * @param password Password pengguna
   * @returns Observable berisi token string
   */
  public login(email: string, password: string): Observable<{ access_token: string, refresh_token: string }> {
    const url = `${this.apiUrl}/auth/login`;

    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const body = { email, password };

    return this.http.post<{ access_token: string, refresh_token: string, expires_in: number }>(url, body, { headers }).pipe(
      map(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        const expiresAt = Date.now() + response.expires_in * 1000;
        localStorage.setItem('access_token_expires_at', expiresAt.toString());

        return response;
      }),
      catchError(this.handleError)
    );

  }

  public refreshAccessToken(refreshToken: string): Observable<string> {
    const url = `${this.apiUrl}/auth/refresh`;
    return this.http.post<{ access_token: string, refresh_token?: string }>(
      url,
      { refresh_token: refreshToken },
      {
        headers: new HttpHeaders({
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      map(response => {
        // Simpan token baru
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        return response.access_token;
      }),
      catchError(this.handleError)
    );
  }


  /**
   * Penanganan error untuk permintaan HTTP.
   * @param error HttpErrorResponse
   * @returns Observable yang melempar error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
     
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
     
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      if (error.error?.detail) {
        errorMessage += `\nDetail: ${error.error.detail}`;
      } else if (typeof error.error === 'string') {
        errorMessage += `\nResponse: ${error.error}`;
      }
    }
    
    console.error('[LoginService] Error:', errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}
