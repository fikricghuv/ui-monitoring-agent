import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserListResponse, UserModel, UserUpdateModel, UserCreateModel } from '../models/user.model';
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

  /**
   * Membuat pengguna baru.
   */
  public createUser(userData: UserCreateModel): Observable<UserModel> {
    const url = `${this.apiUrl}/create-user`;
    return this.http.post<UserModel>(url, userData, {
      headers: this.getHeaders(),
    }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Mengambil profil semua pengguna.
   */
  public getAllUserProfile(
    offset: number = 0,
    limit: number = 10,
    searchQuery?: string
  ): Observable<UserListResponse> {
    let params: any = {
      offset: offset,
      limit: limit
    };

    if (searchQuery && searchQuery.trim() !== '') {
      params.search = searchQuery.trim();
    }

    return this.http.get<UserListResponse>(`${this.apiUrl}/users/all`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Menghapus pengguna berdasarkan ID.
   */
  public deleteUser(userId: string): Observable<void> {
    const url = `${this.apiUrl}/users/${userId}`;
    return this.http.delete<void>(url, {
        headers: this.getHeaders(),
    }).pipe(
        catchError(this.handleError)
    );
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
}
