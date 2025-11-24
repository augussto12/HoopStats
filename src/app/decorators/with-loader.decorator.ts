import { Injector } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export function WithLoader() {
    return function (target: any) {

        const originalNgOnInit = target.prototype.ngOnInit;

        target.prototype.ngOnInit = async function (...args: any[]) {

            // Obtener el injector del componente
            const injector: Injector = (this as any).injector;

            if (!injector) {
                console.error('[WithLoader] ERROR: este componente NO tiene injector. Agregá "constructor(public injector: Injector)"');
                return originalNgOnInit?.apply(this, args);
            }

            const loadingService = injector.get(LoadingService);

            try {
                loadingService.show(); // Mostrar la pelota antes de ejecutar ngOnInit
                if (originalNgOnInit) {
                    await originalNgOnInit.apply(this, args);
                }
            } finally {
                loadingService.hide(); // Ocultar al terminar
            }
        };
    };
}
