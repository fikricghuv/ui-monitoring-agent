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
   * Mengambil total penambahan user baru setiap bulan (untuk dashboard).
   * Membutuhkan API Key yang valid di header 'X-API-Key'.
   * @returns Observable dari object (bulan ke jumlah user baru).
   */
  public getMonthlyNewUsers(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/monthly-new-users`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil total percakapan bulanan (untuk dashboard).
   * Percakapan dihitung berdasarkan room_conversation_id unik.
   * Membutuhkan API Key yang valid di header 'X-API-Key'.
   * @returns Observable dari object (bulan ke jumlah percakapan).
   */
  public getMonthlyConversations(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/monthly-conversations`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil latensi rata-rata harian dalam milidetik.
   * Membutuhkan API Key yang valid.
   * @returns Observable dari object (tanggal ke rata-rata latensi).
   */
  public getDailyAverageLatency(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/daily-avg-latency`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil latensi rata-rata bulanan dalam milidetik.
   * Membutuhkan API Key yang valid.
   * @returns Observable dari object (bulan ke rata-rata latensi).
   */
  public getMonthlyAverageLatency(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/monthly-avg-latency`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil total eskalasi bulanan.
   * Eskalasi diidentifikasi jika agent memanggil tool untuk menyimpan data feedback pelanggan.
   * Mengembalikan data untuk setiap bulan dari Januari hingga bulan saat ini, dengan 0 jika tidak ada data.
   * Membutuhkan API Key yang valid di header 'X-API-Key'.
   * @returns Observable dari object (bulan ke jumlah eskalasi).
   */
  public getMonthlyEscalations(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/monthly-escalations`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getMonthlyTokensUsage(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/monthly-tokens-usage`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil total percakapan mingguan untuk 12 minggu terakhir.
   * Jika tidak ada data untuk minggu tertentu, akan mengisi dengan 0.
   * @returns Observable dari objek { [minggu (YYYY-WW)]: total_percakapan }.
   */
  public getWeeklyTotalConversations(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/conversations/weekly`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil total percakapan bulanan untuk 12 bulan terakhir.
   * Jika tidak ada data untuk bulan tertentu, akan mengisi dengan 0.
   * @returns Observable dari objek { [bulan (YYYY-MM)]: total_percakapan }.
   */
  public getMonthlyTotalConversations(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });
    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/conversations/monthly`, { headers: headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mengambil total percakapan tahunan untuk 6 tahun terakhir.
   * Jika tidak ada data untuk tahun tertentu, akan mengisi dengan 0.
   * @returns Observable dari objek { [tahun (YYYY)]: total_percakapan }.
   */
  public getYearlyTotalConversations(): Observable<{ [key: string]: number }> {
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });
    return this.httpClient.get<{ [key: string]: number }>(`${this.apiUrl}/stats/conversations/yearly`, { headers: headers })
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