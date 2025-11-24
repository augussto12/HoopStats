import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {

    private active = 0;
    private _loading = new BehaviorSubject<boolean>(false);
    public loading$ = this._loading.asObservable();

    show() {
        this.active++;
        this._loading.next(true);
    }

    hide() {
        this.active = Math.max(0, this.active - 1);
        if (this.active === 0) {
            this._loading.next(false);
        }
    }
}
