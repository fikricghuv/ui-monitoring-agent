import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomerModel } from '../models/customer.model';
import { environment } from '../../../environments/environment';

interface CustomerResponse {
  data: CustomerModel[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Terjadi kesalahan tidak diketahui!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Kode: ${error.status}\nPesan: ${error.message}`;
      if (error.error?.detail) {
        errorMessage += `\nDetail: ${error.error.detail}`;
      }
    }
    console.error('CustomerService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET /customers?limit=10&offset=0
   * Mengambil semua customer dengan pagination
   */
  getAllCustomers(limit: number = 10, offset: number = 0): Observable<CustomerResponse> {
    const url = `${this.apiUrl}/customer?limit=${limit}&offset=${offset}`;
    return this.http
      .get<CustomerResponse>(url, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /customers/{customer_id}
   * Mengambil detail customer berdasarkan ID
   */
  getCustomerById(customerId: string): Observable<CustomerModel> {
    return this.http
      .get<CustomerModel>(`${this.apiUrl}/customer/${customerId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
