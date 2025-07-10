import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedCustomerInteractionResponse } from '../models/customer_interaction.model';

@Injectable({ providedIn: 'root' })
export class CustomerInteractionService {
  private apiUrl = environment.backendApiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  public getAllCustomerInteractions(
    offset: number = 0,
    limit: number = 50,
    search?: string
  ): Observable<PaginatedCustomerInteractionResponse> {
    let headers = new HttpHeaders({ 'X-API-Key': this.apiKey });
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<PaginatedCustomerInteractionResponse>(`${this.apiUrl}/interactions`, { headers, params })
      .pipe(catchError((err) => { throw err }));
  }

}
