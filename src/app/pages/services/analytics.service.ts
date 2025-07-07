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
  public getFeedbacks(offset: number, limit: number, search?: string): Observable<FeedbackModel[]> {
    let headers = new HttpHeaders({ 'X-API-Key': this.apiKey });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<FeedbackModel[]>(`${this.apiUrl}/feedbacks`, {
      headers: headers,
      params: params,
    }).pipe(
      catchError(this.handleError)
    );
  }


  public getTotalFeedbacks(): Observable<number> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey, 
    });

    return this.http.get<number>(`${this.apiUrl}/feedbacks/total`, { headers: headers }).pipe(
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

    console.error("analytics service: error: " , errorMessage); 
    
    alert(errorMessage)
    
    return throwError(() => new Error(errorMessage)); 
  }

 }