import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserHistoryResponseModel } from '../models/chat_history_response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class ChatHistoryService 
{
  private apiUrl = environment.backendApiUrl;
  
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  public loadChatHistory(
    userId: string, 
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> 
  {

    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey 
    });

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString()); 

    const url = `${this.apiUrl}/history/${userId}`;

    return this.http.get<UserHistoryResponseModel>(url, { headers: headers, params: params })
      .pipe(

        catchError(this.handleError)
        
      );
  }

  public loadChatHistoryByRoomId(
    roomId: string, 
    offset: number = 0,
    limit: number = 100
  ): Observable<UserHistoryResponseModel> 
  {
    
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey 
      
    });

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString()); 

    const url = `${this.apiUrl}/history/room/${roomId}`;

    return this.http.get<UserHistoryResponseModel>(url, { headers: headers, params: params })
      .pipe(
        
        catchError(this.handleError)
      );
  }

  public getTotalTokens(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
    });

    return this.http.get<number>(`${this.apiUrl}/stats/total-tokens`, { headers: headers }).pipe(
      catchError(this.handleError) 
    );
  }

  public getTotalUsers(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, 
    });

    return this.http.get<number>(`${this.apiUrl}/stats/total-users`, { headers: headers }).pipe(
      catchError(this.handleError) 
    );
  }

  /**
   * Mengambil total jumlah chat untuk room ID spesifik dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @param roomId UUID dari room percakapan.
   * @returns Observable dari jumlah total chat (tipe number).
   */
  public getTotalChats(): Observable<number> { 
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