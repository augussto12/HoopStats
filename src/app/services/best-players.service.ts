import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BestPlayersService {

    constructor(private api: ApiService) { }

    // Obtener últimos mejores jugadores
    async getLatest() {
        const res = await this.api.get<any[]>(`/best-players/latest`);

        return res.map(p => ({
            ...p,
            value: parseInt(p.value)  // "44.0" a 44
        }));
    }



    // Obtener mejores jugadores por fecha específica (YYYY-MM-DD)
    async getByDate(date: string) {
        return await this.api.get<{ date: string, players: any[] }>(`/best-players/${date}`);
    }

    // Obtener histórico completo de días cargados
    async getAllDays() {
        return await this.api.get<{ days: string[] }>(`/best-players/days`);
    }
}
