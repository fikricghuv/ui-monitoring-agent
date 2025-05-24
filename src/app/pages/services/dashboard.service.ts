import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})

export class DashboardService
{
  private apiUrl = environment.backendApiUrl;

  private apiKey = environment.apiKey; 

  constructor(private httpClient: HttpClient) {}

  /**
   * Mengambil total jumlah user unik dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari number (total user).
   */
  public getTotalUsers(): Observable<number> // <--- Ubah nama metode dan tipe kembalian
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru dan tentukan tipe respons sebagai number
    return this.httpClient.get<number>(`${this.apiUrl}/stats/total-users`, { headers: headers })
      .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mengambil total jumlah percakapan dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari number (total percakapan).
   */
  public getTotalConversations(): Observable<number> // <--- Tipe kembalian number
  {
     // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru dan tentukan tipe respons sebagai number
    return this.httpClient.get<number>(`${this.apiUrl}/stats/total-conversations`, { headers: headers })
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mengambil data frekuensi kategori dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari array objek (frekuensi kategori).
   */
  public getCategoriesFrequency(): Observable<any[]> // <--- Metode baru, tipe kembalian any[] (atau model spesifik)
  {
     // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru
    // Menggunakan any[] karena server mengembalikan List[Dict[str, Any]]
    // Jika Anda membuat model TypeScript untuk struktur dictionary tersebut, ganti 'any[]'
    return this.httpClient.get<any[]>(`${this.apiUrl}/stats/categories-frequency`, { headers: headers })
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