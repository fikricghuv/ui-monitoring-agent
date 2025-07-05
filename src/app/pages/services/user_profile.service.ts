import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserModel, UserUpdateModel } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Terjadi kesalahan tidak diketahui!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Kode: ${error.status}\nPesan: ${error.message}`;
      if (error.error?.detail) {
        errorMessage += `\nDetail: ${error.error.detail}`;
      }
    }
    console.error('UserService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Mengambil profil pengguna berdasarkan ID.
   */
  public getUserById(userId: string): Observable<UserModel> {
    const url = `${this.apiUrl}/users/${userId}`;
    return this.http.get<UserModel>(url, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Memperbarui profil pengguna berdasarkan ID.
   */
  public updateUserProfile(userId: string, data: UserUpdateModel): Observable<UserModel> {
    const url = `${this.apiUrl}/users/${userId}`;
    return this.http.put<UserModel>(url, data, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError)
    );
  }
}
