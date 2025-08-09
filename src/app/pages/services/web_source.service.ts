import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WebsiteKBCreateResponse, WebsiteKBInfo } from '../models/web_source.model';

@Injectable({
  providedIn: 'root',
})
export class WebsiteKnowledgeBaseService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Mengambil semua sumber data website yang terdaftar.
   *
   * @returns Observable yang berisi daftar WebsiteKBInfo.
   */
  public getWebsiteSources(): Observable<WebsiteKBInfo[]> {
    return this.http.get<WebsiteKBInfo[]>(`${this.apiUrl}/website-source`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Menambahkan URL website baru sebagai sumber knowledge base.
   *
   * @param urls Array string yang berisi URL yang akan ditambahkan.
   * @returns Observable dari WebsiteKBCreateResponse.
   */
  public addWebsiteSource(url: string): Observable<WebsiteKBCreateResponse> {
    const payload = {
      url:url
    };
    return this.http.post<WebsiteKBCreateResponse>(`${this.apiUrl}/website-source`, payload, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Menghapus sumber website berdasarkan ID uniknya (UUID).
   *
   * @param urlId UUID dari sumber website yang akan dihapus.
   * @returns Observable dari respons penghapusan.
   */
  public deleteWebsiteSource(urlId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/website-source/${urlId}`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Memulai proses embedding untuk semua sumber website yang terdaftar.
   *
   * @returns Observable dari respons proses embedding.
   */
  public processWebsiteEmbedding(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/website-source/process-embedding`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Metode penanganan error untuk permintaan HTTP.
   *
   * @param error Objek HttpErrorResponse.
   * @returns Observable yang memancarkan error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
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