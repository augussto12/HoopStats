import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loading = inject(LoadingService);

    if (req.url.includes('/auth/login')) {
        return next(req);
    }
    loading.show();

    return next(req).pipe(
        finalize(() => loading.hide())
    );
};
