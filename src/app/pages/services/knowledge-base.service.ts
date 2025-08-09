import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
import { UploadResponseModel } from '../models/upload_file_response.model'; 
import { FileInfoModel } from '../models/file_info.model'; 
import { KnowledgeBaseConfigModel, KnowledgeBaseConfigGetResponseModel } from '../models/knowledge_base_config.model'; 
import { EmbedResponseModel } from '../models/embedding_file_response.model'; 
import { DeleteResponseModel } from '../models/delete_file_response.model'; 
import { environment } from '../../../environments/environment';
import { WebsiteKBCreateResponse, WebsiteKBInfo } from '../models/web_source.model';

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
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.http.get<KnowledgeBaseConfigGetResponseModel>(`${this.apiUrl}/knowledge-base/config`, { headers: headers })
       .pipe(
        catchError(this.handleError)
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
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json' 
    });

    return this.http.put<KnowledgeBaseConfigModel>(`${this.apiUrl}/knowledge-base/update-config`, config, { headers: headers }) // Menggunakan PUT
       .pipe(
        catchError(this.handleError) 
      );
  }

  /**
   * Mengunggah file ke server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @param file File yang akan diunggah.
   * @returns Observable dari UploadResponseModel.
   */
  public uploadFile(file: File): Observable<UploadResponseModel> {
    const formData = new FormData();
    formData.append('files', file); // backend menerima multiple 'files'

    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.http.post<UploadResponseModel>(`${this.apiUrl}/files/upload-file`, formData, {
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mendapatkan daftar file yang telah diunggah dari server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @returns Observable dari array FileInfoModel.
   */
  public getUploadedFiles(): Observable<FileInfoModel[]> 
  {

    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.http.get<FileInfoModel[]>(`${this.apiUrl}/files`, { headers: headers })
       .pipe(
        catchError(this.handleError) 
      );
  }

  /**
   * Memulai proses embedding untuk file di server.
   * Membutuhkan API Key di header 'X-API-Key'.
   * Menggunakan path endpoint yang baru.
   * @returns Observable dari EmbedResponseModel.
   */
  public embeddingFile(): Observable<EmbedResponseModel> 
  {
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.http.post<EmbedResponseModel>(`${this.apiUrl}/files/embedding-file`, {}, { headers: headers }) // Menggunakan POST, body kosong jika server tidak butuh body
       .pipe(
        catchError(this.handleError) 
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
    
    let headers = new HttpHeaders({
      'X-API-Key': this.apiKey
    });

    return this.http.delete<DeleteResponseModel>(`${this.apiUrl}/files/${uuidFile}`, { headers: headers })
       .pipe(
        catchError(this.handleError)
      );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey
    });
  }

  // GET /website-source
  public getAllLinks(): Observable<WebsiteKBInfo[]> {
    return this.http.get<WebsiteKBInfo[]>(`${this.apiUrl}/website-source`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST /website-source
  public addLinks(urls: string[]): Observable<WebsiteKBCreateResponse> {
    return this.http.post<WebsiteKBCreateResponse>(`${this.apiUrl}/website-source`, urls, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /website-source/{url_id}
  public deleteLink(urlId: string): Observable<DeleteResponseModel> {
    return this.http.delete<DeleteResponseModel>(`${this.apiUrl}/website-source/${urlId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST /website-source/process-embedding
  public processEmbedding(): Observable<EmbedResponseModel> {
    return this.http.post<EmbedResponseModel>(`${this.apiUrl}/website-source/process-embedding`, {}, {
      headers: this.getHeaders()
    }).pipe(
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
