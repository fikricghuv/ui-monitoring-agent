import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserHistoryResponseModel } from '../models/chat_history_response.model';
import { environment } from '../../../environments/environment';
import { ChatHistoryResponseModel } from '../models/chat_history_response.model'; // Pastikan path model ini benar

@Injectable({
  providedIn: 'root',
})

export class ChatHistoryService 
{
  private apiUrl = environment.backendApiUrl;
  
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  public loadChatHistory(
    userId: string, // Menerima userId sebagai string (representasi UUID)
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> // Mengembalikan Observable dari model respons baru
  {
    // 1. Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey // Tambahkan header API Key
    });

    // 2. Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString()) // Tambahkan offset
      .set('limit', limit.toString());   // Tambahkan limit

    // 3. Buat URL dengan Path Parameter
    // Gunakan room_id di path URL
    const url = `${this.apiUrl}/history/${userId}`;

    // 4. Lakukan permintaan GET dengan headers dan params
    return this.http.get<UserHistoryResponseModel>(url, { headers: headers, params: params })
      .pipe(
        // 5. Tambahkan penanganan error dasar
        catchError(this.handleError)
        // Anda bisa menambahkan operator 'map' di sini jika perlu memproses respons
        // sebelum dikirim ke subscriber, misalnya hanya mengambil array 'history'
        // Contoh: map(response => response.history)
      );
  }

  public loadChatHistoryByRoomId(
    roomId: string, // Menerima userId sebagai string (representasi UUID)
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> // Mengembalikan Observable dari model respons baru
  {
    // 1. Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey // Tambahkan header API Key
    });

    // 2. Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString()) // Tambahkan offset
      .set('limit', limit.toString());   // Tambahkan limit

    // 3. Buat URL dengan Path Parameter
    // Gunakan room_id di path URL
    const url = `${this.apiUrl}/history/room/${roomId}`;

    // 4. Lakukan permintaan GET dengan headers dan params
    return this.http.get<UserHistoryResponseModel>(url, { headers: headers, params: params })
      .pipe(
        // 5. Tambahkan penanganan error dasar
        catchError(this.handleError)
        // Anda bisa menambahkan operator 'map' di sini jika perlu memproses respons
        // sebelum dikirim ke subscriber, misalnya hanya mengambil array 'history'
        // Contoh: map(response => response.history)
      );
  }

  public getTotalTokens(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, // Tambahkan header API Key
    });

    // Lakukan permintaan GET ke endpoint /feedbacks/total
    return this.http.get<number>(`${this.apiUrl}/stats/total-tokens`, { headers: headers }).pipe(
      catchError(this.handleError) // Gunakan penanganan error yang sama
    );
  }

  public getTotalUsers(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, // Tambahkan header API Key
    });

    // Lakukan permintaan GET ke endpoint /feedbacks/total
    return this.http.get<number>(`${this.apiUrl}/stats/total-users`, { headers: headers }).pipe(
      catchError(this.handleError) // Gunakan penanganan error yang sama
    );
  }

  /**
   * Mengambil total jumlah chat untuk room ID spesifik dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @param roomId UUID dari room percakapan.
   * @returns Observable dari jumlah total chat (tipe number).
   */
  public getTotalChats(): Observable<number> { // roomId bertipe string untuk UUID
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
    });
    
    return this.http.get<number>(`${this.apiUrl}/stats/total-conversations`, { headers: headers }).pipe(
      catchError(this.handleError)
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

  // Anda bisa menambahkan metode lain di sini
}