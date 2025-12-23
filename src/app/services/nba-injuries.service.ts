import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface InjuryResponse {
    success: boolean;
    timestamp: string;
    data: any[];
}

@Injectable({
    providedIn: 'root'
})
export class NbaInjuriesService {
    private apiService = inject(ApiService);

    async getInjuryReport(): Promise<InjuryResponse> {
        return this.apiService.get<InjuryResponse>('/injuries');
    }
}
