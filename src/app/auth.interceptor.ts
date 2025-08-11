// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError, BehaviorSubject } from 'rxjs';
// import { catchError, switchMap, filter, take } from 'rxjs/operators';
// import { LoginService } from '../app/pages/services/login.service';
// import { environment } from '../environments/environment';

// export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
//   const loginService = inject(LoginService);
//   const apiKey = environment.apiKey;
//   const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
//   const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

//   let headers = request.headers.set('X-API-Key', apiKey);
//   if (accessToken) {
//     headers = headers.set('Authorization', `Bearer ${accessToken}`);
//   }

//   const modifiedRequest = request.clone({ headers });

//   return next(modifiedRequest).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
        
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('access_token_expires_at');

//         window.location.href = '/login';

//       } else if (error.status === 403) {
//         console.error('Anda tidak memiliki izin untuk mengakses resource ini.');
        
//       } else if (error.status === 500) {
//         console.error('Terjadi kesalahan pada server. Silakan coba lagi.');

//       } else {
//         console.error(`Error: ${error.status} - ${error.message}`);

//       }
//       return throwError(() => error);
//     })
    
//   );

// };

// src/app/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../app/pages/services/login.service';
import { ErrorHandlingService } from '../app/pages/services/error-handling.service';
import { environment } from '../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const loginService = inject(LoginService);
  const errorHandlingService = inject(ErrorHandlingService); 
  const apiKey = environment.apiKey;
  const accessToken = localStorage.getItem('access_token')

  let headers = request.headers.set('X-API-Key', apiKey);
  if (accessToken) {
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const modifiedRequest = request.clone({ headers });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {

        errorHandlingService.showError('Sesi Berakhir', 'Silakan masuk kembali untuk melanjutkan.');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token_expires_at');

        window.location.href = '/login';

      } else if (error.status === 403) {
        errorHandlingService.showError('Akses Ditolak', 'Silakan masuk kembali untuk melanjutkan.');

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token_expires_at');

        window.location.href = '/login';

      } else {
        errorHandlingService.showError('Terjadi Kesalahan', 'Terjadi kesalahan dari sisi server.');
      }
      
      return throwError(() => error);
    })
  );
};