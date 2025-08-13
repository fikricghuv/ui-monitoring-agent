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

      const errorCode = error.error?.code || null;

      const erroDetail = error.error?.detail || null;

      console.log('error code dan error detail :', erroDetail, errorCode)

      if (error.status === 401 && errorCode === "INVALID_EMAIL_OR_PASSWORD") {
        errorHandlingService.showError(errorCode, erroDetail);

      } else if (error.status === 500 && errorCode === "LOGIN_ERROR") {
        errorHandlingService.showError(errorCode, erroDetail);

      } else if (error.status === 401 && errorCode === "ACCESS_TOKEN_ERROR") {
        errorHandlingService.showError(errorCode, erroDetail);

      } else if (error.status === 401 && errorCode === "REFRESH_TOKEN_ERROR") {
        errorHandlingService.showError(errorCode, erroDetail);

      } else if (error.status === 401) {
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

      } else if (error.status === 500){
        errorHandlingService.showError('ERROR_SERVER', 'Terjadi kesalahan internal server.');
      } else if (error.status === 0) {
          errorHandlingService.showError(
            'Masalah koneksi',
            'Silakan periksa koneksi internet atau coba lagi nanti.'
          );
      }
      return throwError(() => error);
    })
  );
};