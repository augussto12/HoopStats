import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loading = inject(LoadingService);

    const skip =
        req.url.includes('/auth/login') ||    
        req.url.includes('/games?live=all') ||  
        req.url.includes('/best-players/latest') ||
        req.url.includes('/notifications'); 

    if (skip) {
        return next(req);
    }

    loading.show();

    return next(req).pipe(
        finalize(() => loading.hide())
    );
};
