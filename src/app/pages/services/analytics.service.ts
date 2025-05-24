import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedbackModel } from '../models/feedback.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AnalyticsService
{
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  /**
   * Mengambil feedback customer dari server dengan pagination.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @param offset Jumlah item yang akan dilewati (untuk pagination).
   * @param limit Jumlah item per halaman (untuk pagination, maks 200 di server).
   * @returns Observable dari array FeedbackModel.
   */
  public getFeedbacks(offset: number, limit: number): Observable<FeedbackModel[]>
  {
    // 1. Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey // Tambahkan header API Key
      // Tambahkan header lain jika diperlukan, contoh: 'Content-Type': 'application/json'
    });

    // 2. Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString()) // Tambahkan offset
      .set('limit', limit.toString());   // Tambahkan limit

    // 3. Lakukan permintaan GET dengan headers dan params
    return this.http.get<FeedbackModel[]>(`${this.apiUrl}/feedbacks`, { headers: headers, params: params })
      .pipe(
        // 4. Tambahkan penanganan error dasar
        catchError(this.handleError)
      );
  }

  public getTotalFeedbacks(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, // Tambahkan header API Key
    });

    // Lakukan permintaan GET ke endpoint /feedbacks/total
    return this.http.get<number>(`${this.apiUrl}/feedbacks/total`, { headers: headers }).pipe(
      catchError(this.handleError) // Gunakan penanganan error yang sama
    );
  }

  /**
   * Metode penanganan error untuk permintaan HTTP.
   * @param error Objek HttpErrorResponse.
   * @returns Observable yang memancarkan error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      // Error.status adalah kode status HTTP (misalnya 401, 404, 500)
      // Error.error bisa berisi pesan error dari server jika disediakan
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      // Jika server mengirimkan detail error di body respons
      if (error.error && typeof error.error === 'object' && error.error.detail) {
         errorMessage += `\nDetail: ${error.error.detail}`;
      } else if (error.error && typeof error.error === 'string') {
         errorMessage += `\nServer Response: ${error.error}`;
      }
    }
    console.error("analytics service: error: " , errorMessage); 
    alert(errorMessage)
    return throwError(() => new Error(errorMessage)); // Kembalikan Observable error
  }

 }