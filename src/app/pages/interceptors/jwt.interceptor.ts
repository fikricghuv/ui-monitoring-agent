import { HttpInterceptorFn } from '@angular/common/http';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Ambil token dari localStorage atau sumber lain
  const token = localStorage.getItem('token');

  // Jika token tersedia, tambahkan ke header Authorization
  const clonedReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Lanjutkan ke next handler
  return next(clonedReq);
};
