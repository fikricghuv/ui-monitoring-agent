import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders, HttpErrorResponse
import { BehaviorSubject, firstValueFrom, Observable, throwError } from 'rxjs'; // Import throwError, Observable
import { catchError, tap } from 'rxjs/operators'; // Import catchError

import { environment } from '../../../environments/environment'; // Import environment

// --- Definisi Model Angular yang sesuai dengan schema Pydantic server ---

// Enum untuk peran user, sesuai dengan UserRole di server
export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Chatbot = 'chatbot',
}

// Model untuk request body endpoint /auth/generate_user_id
// Sesuai dengan schema GenerateUserIdRequest dari server
export interface GenerateUserIdRequestModel {
  role: UserRole;
}

// Model untuk respons endpoint /auth/generate_user_id
// Sesuai dengan schema UserIdResponse dari server
export interface UserIdResponseModel {
  user_id: string;
  role: UserRole;
  created_at: string; // Tanggal/Waktu biasanya string (ISO 8601) dari API
}

// --- Akhir Definisi Model ---


@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly USERID_LOCAL_STORAGE = 'userId';
  private readonly ADMINID_LOCAL_STORAGE = 'adminId';

  // Mengambil API Key dari environment
  private apiKey = environment.apiKey;

  public initializationStatusSubject = new BehaviorSubject<boolean>(false);
  readonly initializationStatus$ = this.initializationStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // Memulai proses inisialisasi ID saat service dibuat
    this.initializeIds();
  }

  /**
   * Menginisialisasi User ID dan Admin ID dari local storage atau server jika belum ada.
   * Menggunakan metode POST baru untuk generate ID.
   */
  private async initializeIds(): Promise<void> {
    const storedUserId = localStorage.getItem(this.USERID_LOCAL_STORAGE);
    const storedAdminId = localStorage.getItem(this.ADMINID_LOCAL_STORAGE);

    // Jika kedua ID sudah ada di local storage, set status dan keluar
    if (storedUserId && storedAdminId) {
      console.log('SessionService: User ID dan Admin ID ditemukan di local storage.');
      this.initializationStatusSubject.next(true); // Set status inisialisasi ke true
      return;
    }

    console.log('SessionService: User ID atau Admin ID tidak ditemukan, melakukan generate dari server.');

    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json' // Diperlukan karena mengirim body JSON
    });

    const generateUrl = `${environment.backendApiUrl}/auth/generate_user_id`;

    try {
      // --- Generate User ID ---
      if (!storedUserId) {
          console.log('SessionService: Generating User ID...');
          const userPayload: GenerateUserIdRequestModel = { role: UserRole.User }; // Payload untuk user
          const userResponse = await firstValueFrom(
            this.http.post<UserIdResponseModel>(generateUrl, userPayload, { headers: headers }) // Menggunakan POST dengan payload dan headers
              .pipe(
                 catchError(this.handleError) // Tambahkan penanganan error
              )
          );
          localStorage.setItem(this.USERID_LOCAL_STORAGE, userResponse.user_id); // Simpan user_id dari respons
          console.log('SessionService: User ID berhasil digenerate dan disimpan:', userResponse.user_id);
      } else {
          console.log('SessionService: User ID sudah ada di local storage.');
      }


      // --- Generate Admin ID ---
      if (!storedAdminId) {
          console.log('SessionService: Generating Admin ID...');
          const adminPayload: GenerateUserIdRequestModel = { role: UserRole.Admin }; // Payload untuk admin
          const adminResponse = await firstValueFrom(
            this.http.post<UserIdResponseModel>(generateUrl, adminPayload, { headers: headers }) // Menggunakan POST dengan payload dan headers
               .pipe(
                 catchError(this.handleError) // Tambahkan penanganan error
              )
          );
          localStorage.setItem(this.ADMINID_LOCAL_STORAGE, adminResponse.user_id); // Simpan admin_id dari respons
          console.log('SessionService: Admin ID berhasil digenerate dan disimpan:', adminResponse.user_id);
      } else {
           console.log('SessionService: Admin ID sudah ada di local storage.');
      }


      // Setelah berhasil mendapatkan kedua ID (atau jika sudah ada), set status inisialisasi
      this.initializationStatusSubject.next(true);
      console.log('SessionService: Inisialisasi ID selesai.');

    } catch (error) {
      console.error('SessionService: Gagal mendapatkan User ID atau Admin ID dari server:', error);
      this.initializationStatusSubject.next(false); // Set status inisialisasi ke false jika gagal
      // TODO: Implementasi penanganan error yang lebih baik di sini,
      // misalnya menampilkan pesan ke pengguna atau mencoba kembali.
    }
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
    console.error('SessionService HTTP Error:', errorMessage); // Log error ke console
    // Anda bisa menggunakan MessageService PrimeNG di sini untuk menampilkan pesan ke pengguna
    // this.messageService.add({ severity: 'error', summary: 'API Error', detail: 'Failed to generate session IDs.' });
    return throwError(() => new Error(errorMessage)); // Kembalikan Observable error
  }


  /**
   * Mendapatkan User ID dari local storage.
   * @returns User ID atau null jika tidak ada.
   */
  public getUserId(): string | null {
    return localStorage.getItem(this.USERID_LOCAL_STORAGE);
  }

  /**
   * Mendapatkan Admin ID dari local storage.
   * @returns Admin ID atau null jika tidak ada.
   */
  public getAdminId(): string | null {
    return localStorage.getItem(this.ADMINID_LOCAL_STORAGE);
  }

  /**
   * Menghapus User ID dan Admin ID dari local storage dan menginisialisasi ulang session.
   */
  public clearSession(): void {
    console.log('SessionService: Clearing session...');
    localStorage.removeItem(this.USERID_LOCAL_STORAGE);
    localStorage.removeItem(this.ADMINID_LOCAL_STORAGE);
    this.initializationStatusSubject.next(false); // Set status ke false sebelum inisialisasi ulang
    this.initializeIds(); // Inisialisasi ulang untuk mendapatkan ID baru
    console.log('SessionService: Session cleared and re-initialization started.');
  }
}
