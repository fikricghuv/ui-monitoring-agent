import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserActivityLogModel } from '../models/user-activity-log.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserActivityLogService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  /**
   * Ambil log aktivitas berdasarkan user_id
   */
  public getActivityLogsByUserId(
    userId: string,
    offset: number = 0,
    limit: number = 10
  ): Observable<UserActivityLogModel[]> {
    const headers = new HttpHeaders({ 'X-API-Key': this.apiKey });

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http
      .get<UserActivityLogModel[]>(`${this.apiUrl}/activity-logs/${userId}`, {
        headers: headers,
        params: params,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error ${error.status}: ${error.message}`;
    }
    console.error('[UserActivityLogService] Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
