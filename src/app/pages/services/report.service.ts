import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private httpClient: HttpClient) {}

  /**
   * Mendownload laporan dalam format CSV.
   * @param reportType Tipe report, misal: 'CUSTOMER_FEEDBACK'
   * @param startDate Tanggal mulai (format: YYYY-MM-DD)
   * @param endDate Tanggal akhir (format: YYYY-MM-DD)
   * @returns Observable berisi file CSV (blob)
   */
  public downloadCSVReport(reportType: string, startDate: string, endDate: string): Observable<Blob> {
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const url = `${this.apiUrl}/report/download-csv?report_type=${reportType}&start_date=${startDate}&end_date=${endDate}`;

    return this.httpClient.get(url, {
      headers: headers,
      responseType: 'blob'  // penting untuk file
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handler error HTTP.
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
