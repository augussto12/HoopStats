import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MarketLockService {

    constructor(private api: ApiService) { }

    getMarketLock() {
        return this.api.get('/market-lock');
    }
}
