import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { LoginService } from '../app/pages/services/login.service';
import { environment } from '../environments/environment';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const loginService = inject(LoginService);
  const apiKey = environment.apiKey;
  const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

  // Tambahkan Authorization dan X-API-Key jika tersedia
  let headers = request.headers.set('X-API-Key', apiKey);
  if (accessToken) {
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const modifiedRequest = request.clone({ headers });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return loginService.refreshAccessToken(refreshToken).pipe(
            switchMap((newToken: string) => {
              isRefreshing = false;
              localStorage.setItem('access_token', newToken);
              refreshTokenSubject.next(newToken);

              const retryHeaders = request.headers
                .set('X-API-Key', apiKey)
                .set('Authorization', `Bearer ${newToken}`);

              return next(request.clone({ headers: retryHeaders }));
            }),
            catchError(err => {
              isRefreshing = false;
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              const retryHeaders = request.headers
                .set('X-API-Key', apiKey)
                .set('Authorization', `Bearer ${token!}`);

              return next(request.clone({ headers: retryHeaders }));
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
