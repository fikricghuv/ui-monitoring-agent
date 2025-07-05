import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
import { RoomConversationModel } from '../models/room.model'; 
import { environment } from '../../../environments/environment'; 


@Injectable({
  providedIn: 'root',
})
export class RoomService 
{
  private apiUrl = environment.backendApiUrl; 
  private apiKey = environment.apiKey; 

  constructor(private http: HttpClient) {}

  /**
   * Metode penanganan error untuk permintaan HTTP.
   * @param error Objek HttpErrorResponse.
   * @returns Observable yang memancarkan error.
   */
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
    console.error('RoomService HTTP Error:', errorMessage); 

    return throwError(() => new Error(errorMessage)); 
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
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    
    const url = `${this.apiUrl}/rooms/all`;

    return this.http.get<RoomConversationModel[]>(url, { headers: headers, params: params })
      .pipe(
        catchError(this.handleError) 
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
  public getActiveRooms(offset: number = 0, limit: number = 30): Observable<RoomConversationModel[]> {
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    const url = `${this.apiUrl}/rooms/active-rooms`; 

    return this.http.get<RoomConversationModel[]>(url, { headers: headers, params: params })
      .pipe(
        catchError(this.handleError) 
      );
  }

}
