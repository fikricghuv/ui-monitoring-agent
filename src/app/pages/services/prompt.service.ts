import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders, HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError

// Import model yang sesuai dengan schema respons server (PromptResponse)
import { Prompt } from '../models/prompt.model'; // Asumsi model Prompt sesuai dengan PromptResponse

import { environment } from '../../../environments/environment'; // Menggunakan environment variables


@Injectable({
  providedIn: "root",
})
export class PromptService
{
  private apiUrl = environment.backendApiUrl; // Mengambil API URL dari environment
  private apiKey = environment.apiKey; // Mengambil API Key dari environment

  constructor(private httpClient: HttpClient) {}

  /**
   * Menyimpan atau memperbarui prompt di server berdasarkan nama.
   * Menggunakan metode PUT dan membutuhkan API Key di header 'X-API-Key'.
   * @param promptName Nama prompt yang akan disimpan/diperbarui.
   * @param content Konten prompt.
   * @returns Observable dari Prompt (prompt yang diperbarui).
   */
  public savePrompt(promptName: string, content: string): Observable<Prompt> // Ubah tipe kembalian ke Prompt
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json' // Diperlukan karena mengirim body JSON
    });

    const url = `${this.apiUrl}/prompts/${promptName}`;
    // Payload sesuai dengan schema PromptUpdate server (asumsi hanya properti 'content')
    const payload = { content: content }; // Pastikan nama properti 'content' sesuai dengan PromptUpdate schema

    // Gunakan metode PUT dengan headers
    return this.httpClient.put<Prompt>(url, payload, { headers: headers }) // Ubah tipe kembalian
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mendapatkan daftar semua prompt dari server.
   * Menggunakan metode GET dan membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari array Prompt.
   */
  public loadPrompts(): Observable<Prompt[]> // Tipe kembalian array Prompt
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const url = `${this.apiUrl}/prompts`;

    // Gunakan metode GET dengan headers
    return this.httpClient.get<Prompt[]>(url, { headers: headers })
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
}
