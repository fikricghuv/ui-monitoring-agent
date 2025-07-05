import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserHistoryResponseModel } from '../models/chat_history_response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatHistoryService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Authorization': `Bearer ${accessToken}`,
    });
  }

  public loadChatHistory(
    userId: string,
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    const url = `${this.apiUrl}/history/${userId}`;

    return this.http.get<UserHistoryResponseModel>(url, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  public loadChatHistoryByRoomId(
    roomId: string,
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    const url = `${this.apiUrl}/history/room/${roomId}`;

    return this.http.get<UserHistoryResponseModel>(url, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  public getTotalTokens(): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/stats/total-tokens`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  public getTotalUsers(): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/stats/total-users`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  public getTotalChats(): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/stats/total-conversations`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.detail) {
        errorMessage += `\nDetail: ${error.error.detail}`;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage += `\nServer Response: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
