import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders, HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError

// Import models yang sesuai dengan schema respons server
import { UploadResponseModel } from '../models/upload_file_response.model'; // Asumsi ini sesuai dengan UploadSuccessResponse
import { FileInfoModel } from '../models/file_info.model'; // Asumsi ini sesuai dengan FileInfo
import { KnowledgeBaseConfigModel, KnowledgeBaseConfigGetResponseModel } from '../models/knowledge_base_config.model'; 
import { EmbedResponseModel } from '../models/embedding_file_response.model'; // Asumsi ini sesuai dengan EmbeddingProcessResponse
import { DeleteResponseModel } from '../models/delete_file_response.model'; // Asumsi ini sesuai dengan FileDeletedResponse

import { environment } from '../../../environments/environment'; // Menggunakan environment variables

@Injectable({
  providedIn: 'root',
})
export class KnowledgeBaseService
{
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  /**
   * Mendapatkan konfigurasi knowledge base dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * @returns Observable dari ConfigResponsemodel (atau KnowledgeBaseConfigModel).
   */
  public getKnowledgeBaseConfig(): Observable<KnowledgeBaseConfigGetResponseModel> // Asumsi ConfigResponsemodel sesuai dengan KnowledgeBaseConfig
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru
    return this.http.get<KnowledgeBaseConfigGetResponseModel>(`${this.apiUrl}/knowledge-base/config`, { headers: headers })
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Memperbarui konfigurasi knowledge base di server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan metode PUT.
   * @param config Objek konfigurasi baru.
   * @returns Observable dari KnowledgeBaseConfigModel (konfigurasi yang diperbarui).
   */
  public updateKnowledgeBaseConfig(config: KnowledgeBaseConfigModel): Observable<KnowledgeBaseConfigModel> // Ubah tipe kembalian, gunakan PUT
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json' // Biasanya diperlukan untuk body JSON
    });

    // Gunakan path endpoint yang baru dan metode PUT
    return this.http.put<KnowledgeBaseConfigModel>(`${this.apiUrl}/knowledge-base/update-config`, config, { headers: headers }) // Menggunakan PUT
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mengunggah file ke server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @param file File yang akan diunggah.
   * @returns Observable dari UploadResponseModel.
   */
  public uploadFile(file: File): Observable<UploadResponseModel> // Asumsi UploadResponseModel sesuai dengan UploadSuccessResponse
  {
    // FormData biasanya tidak memerlukan header Content-Type; browser akan mengaturnya
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    const formData = new FormData();
    formData.append('file', file);

    // Gunakan path endpoint yang baru
    return this.http.post<UploadResponseModel>(`${this.apiUrl}/files/upload-file`, formData, { headers: headers })
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Mendapatkan daftar file yang telah diunggah dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @returns Observable dari array FileInfoModel.
   */
  public getUploadedFiles(): Observable<FileInfoModel[]> // Asumsi FileInfoModel[] sesuai dengan List[FileInfo]
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru
    return this.http.get<FileInfoModel[]>(`${this.apiUrl}/files`, { headers: headers })
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Memulai proses embedding untuk file di server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @returns Observable dari EmbedResponseModel.
   */
  public embeddingFile(): Observable<EmbedResponseModel> // Asumsi EmbedResponseModel sesuai dengan EmbeddingProcessResponse
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru dan metode POST (sesuai server)
    return this.http.post<EmbedResponseModel>(`${this.apiUrl}/files/embedding-file`, {}, { headers: headers }) // Menggunakan POST, body kosong jika server tidak butuh body
       .pipe(
        catchError(this.handleError) // Tambahkan penanganan error
      );
  }

  /**
   * Menghapus file dari server berdasarkan UUID.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru dan path parameter UUID.
   * @param uuidFile UUID dari file yang akan dihapus.
   * @returns Observable dari DeleteResponseModel.
   */
  public removeFile(uuidFile: string): Observable<DeleteResponseModel> // Asumsi DeleteResponseModel sesuai dengan FileDeletedResponse
  {
    // Siapkan Headers, termasuk API Key
    const headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    // Gunakan path endpoint yang baru dan sertakan uuidFile di URL
    return this.http.delete<DeleteResponseModel>(`${this.apiUrl}/files/${uuidFile}`, { headers: headers })
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
