import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
import { Prompt } from '../models/prompt.model'; 

import { environment } from '../../../environments/environment'; 


@Injectable({
  providedIn: "root",
})
export class PromptService
{
  private apiUrl = environment.backendApiUrl; 
  private apiKey = environment.apiKey;

  constructor(private httpClient: HttpClient) {}

  /**
   * Menyimpan atau memperbarui prompt di server berdasarkan nama.
   * Menggunakan metode PUT dan membutuhkan API Key di header 'X-API-Key'.
   * @param promptName Nama prompt yang akan disimpan/diperbarui.
   * @param content Konten prompt.
   * @returns Observable dari Prompt (prompt yang diperbarui).
   */
  public savePrompt(promptName: string, content: string): Observable<Prompt>
  {

    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json' 
    });

    const url = `${this.apiUrl}/prompts/${promptName}`;
    
    const payload = { content: content }; 

    return this.httpClient.put<Prompt>(url, payload, { headers: headers }) 
       .pipe(
        catchError(this.handleError) 
      );
  }

  /**
   * Mendapatkan daftar semua prompt dari server.
   * Menggunakan metode GET dan membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari array Prompt.
   */
  public loadPrompts(): Observable<Prompt[]> 
  {

    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const url = `${this.apiUrl}/prompts`;

    return this.httpClient.get<Prompt[]>(url, { headers: headers })
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
