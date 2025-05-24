import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders, HttpParams, HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError

// Import model RoomConversationModel
import { RoomConversationModel } from '../models/room.model'; // Pastikan path ini benar
import { environment } from '../../../environments/environment'; // Menggunakan environment variables


@Injectable({
  providedIn: 'root',
})
export class RoomService // Menggunakan nama RoomService
{
  private apiUrl = environment.backendApiUrl; // Mengambil API URL dari environment
  private apiKey = environment.apiKey; // Mengambil API Key dari environment

  constructor(private http: HttpClient) {}

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
    console.error('RoomService HTTP Error:', errorMessage); // Log error ke console
    // Anda bisa menggunakan MessageService PrimeNG di sini untuk menampilkan pesan ke pengguna
    // this.messageService.add({ severity: 'error', summary: 'API Error', detail: 'Failed to fetch rooms.' });
    return throwError(() => new Error(errorMessage)); // Kembalikan Observable error
  }


  /**
   * Mendapatkan daftar semua room conversation dari server dengan pagination.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Asumsi endpoint server adalah /rooms/all.
   * @param offset Jumlah item yang akan dilewati (untuk pagination). Default 0.
   * @param limit Jumlah item per halaman (untuk pagination). Default 100.
   * @returns Observable dari array RoomConversationModel.
   */
  public getAllRooms(offset: number = 0, limit: number = 100): Observable<RoomConversationModel[]> {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    // Asumsi endpoint server untuk get all rooms
    const url = `${this.apiUrl}/rooms/all`; // <--- Sesuaikan jika endpoint server berbeda

    // Lakukan permintaan GET dengan headers dan params
    return this.http.get<RoomConversationModel[]>(url, { headers: headers, params: params })
      .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mendapatkan daftar room conversation yang aktif dari server dengan pagination.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Asumsi endpoint server adalah /rooms/active.
   * @param offset Jumlah item yang akan dilewati (untuk pagination). Default 0.
   * @param limit Jumlah item per halaman (untuk pagination). Default 100.
   * @returns Observable dari array RoomConversationModel.
   */
  public getActiveRooms(offset: number = 0, limit: number = 15): Observable<RoomConversationModel[]> {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Siapkan Parameter Query untuk Pagination
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    // Asumsi endpoint server untuk get active rooms
    const url = `${this.apiUrl}/rooms/active-rooms`; // <--- Sesuaikan jika endpoint server berbeda

    // Lakukan permintaan GET dengan headers dan params
    return this.http.get<RoomConversationModel[]>(url, { headers: headers, params: params })
      .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  // Anda bisa menambahkan metode lain terkait room di sini (misalnya, getRoomById, createRoom, closeRoom, dll.)
}
