import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders, HttpParams, HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError

// Import model yang sesuai dengan schema respons server
// Pastikan path ini sesuai dengan struktur folder Anda
import { ChatHistoryResponseModel } from '../models/chat_history_response.model';

import { environment } from '../../../environments/environment'; // Menggunakan environment variables

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private apiUrl = environment.backendApiUrl; // Mengambil API URL dari environment
  private apiKey = environment.apiKey; // Mengambil API Key dari environment

  constructor(private http: HttpClient) {}

  /**
   * Mendapatkan seluruh riwayat chat dari server dengan pagination.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @param offset Jumlah item yang akan dilewati (untuk pagination). Default 0.
   * @param limit Jumlah item per halaman (untuk pagination, maks 200 di server). Default 100.
   * @returns Observable dari array ChatHistoryResponseModel.
   */
  public getChatHistory(offset: number, limit: number): Observable<ChatHistoryResponseModel[]> { // Tambahkan parameter pagination
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString()) // Tambahkan offset
      .set('limit', limit.toString());   // Tambahkan limit

    // Gunakan path endpoint yang baru
    const url = `${this.apiUrl}/history/all`;

    // Lakukan permintaan GET dengan headers dan params
    return this.http.get<ChatHistoryResponseModel[]>(url, { headers: headers, params: params })
      .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
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
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.detail) {
         errorMessage += `\nDetail: ${error.error.detail}`;
      } else if (error.error && typeof error.error === 'string') {
         errorMessage += `\nServer Response: ${error.error}`;
      }
    }
    console.error(errorMessage); // Log error ke console
    // Anda bisa menggunakan MessageService PrimeNG di sini untuk menampilkan pesan ke pengguna
    return throwError(() => new Error(errorMessage)); // Kembalikan Observable error
  }

  // Tambahkan metode lain yang dibutuhkan service monitoring di sini
}
