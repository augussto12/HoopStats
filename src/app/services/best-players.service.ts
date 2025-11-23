import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BestPlayersService {

    constructor(private api: ApiService) { }

    // Obtener últimos mejores jugadores (día más reciente en DB)
    async getLatest() {
        return await this.api.get<{ date: string, players: any[] }>(`/best-players/latest`);
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
