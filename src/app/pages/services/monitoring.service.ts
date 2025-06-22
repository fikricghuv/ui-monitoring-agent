import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
import { ChatHistoryResponseModel } from '../models/chat_history_response.model';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private apiUrl = environment.backendApiUrl; 
  private apiKey = environment.apiKey; 

  constructor(private http: HttpClient) {}

  /**
   * Mendapatkan seluruh riwayat chat dari server dengan pagination.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @param offset Jumlah item yang akan dilewati (untuk pagination). Default 0.
   * @param limit Jumlah item per halaman (untuk pagination, maks 200 di server). Default 100.
   * @returns Observable dari array ChatHistoryResponseModel.
   */
  public getChatHistory(offset: number, limit: number): Observable<ChatHistoryResponseModel[]> { // Tambahkan parameter pagination
    
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());  

    const url = `${this.apiUrl}/history/all`;

    return this.http.get<ChatHistoryResponseModel[]>(url, { headers: headers, params: params })
      .pipe(
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
