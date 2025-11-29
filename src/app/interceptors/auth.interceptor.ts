import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();

    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: req.headers.has('Authorization')
                    ? req.headers.get('Authorization')!
                    : `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error) => {

            // SI EL TOKEN EXPIRÓ O ES INVÁLIDO
            if (error.status === 401) {

                // Limpiar sesión
                authService.logout();

                // Redirigir a login
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};
