// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationModel } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  private socket: WebSocket | null = null;
  private notificationSubject = new Subject<NotificationModel>();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
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
    console.error('NotificationService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET /notifications
   * Ambil semua notifikasi user
   */
  getNotifications(): Observable<{ data: NotificationModel[] }> {
    const url = `${this.apiUrl}/notifications`;
    return this.http
      .get<{ data: NotificationModel[] }>(url, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    const url = `${this.apiUrl}/notifications/${notificationId}/read`;
    return this.http.patch(
        url,
        null,
        {
            // params: { receiver_id: userId },
            headers: this.getHeaders()
        }
    ).pipe(catchError(this.handleError));
  }

  /**
   * POST /notification/token
   * Kirim token FCM ke backend untuk disimpan
   */
  registerFCMToken(token: string): Observable<any> {
    const url = `${this.apiUrl}/fcm-token`;
    return this.http
      .post(url, { token }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH /notifications/deactivate-all
   * Menonaktifkan semua notifikasi aktif untuk user tertentu
   */
  deactivateAllActiveNotifications(): Observable<any> {
    const url = `${this.apiUrl}/notifications/clear`;
    return this.http
      .patch(url, null, {
        // params: { receiver_id: userId },
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

}
