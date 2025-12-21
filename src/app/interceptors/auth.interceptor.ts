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

    // Endpoints públicos donde NO queremos meter lógica de 403 redirect
    const isPublic =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/verify-email') ||
        req.url.includes('/auth/resend-verification') ||
        req.url.includes('/auth/forgot-password') ||
        req.url.includes('/auth/reset-password');

    let authReq = req;

    if (token && !req.headers.has('Authorization')) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error?.status === 401) {
                authService.logout();
                router.navigate(['/login']);
            }

            // 👇 Solo redirigir por 403 si NO es público
            if (error?.status === 403 && !isPublic) {
                router.navigate(['/profile'], {
                    state: {
                        msg: error?.error?.error || 'Debes verificar tu email para acceder a esta sección.'
                    }
                });
            }

            return throwError(() => error);
        })
    );
};
