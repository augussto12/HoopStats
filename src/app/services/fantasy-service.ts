import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FantasyService {

    constructor(private api: ApiService) { }

    // ============================
    // Obtener mi equipo
    // ============================
    getMyTeam() {
        return this.api.get<{
            team: {
                id: number;
                name: string;
                total_points: number;
                budget: number;
            } | null;
            players: any[];
        }>('/fantasy/my-team');
    }

    // ============================
    // Crear equipo
    // ============================
    createTeam(name: string) {
        return this.api.post('/fantasy/create', { name });
    }

    // ============================
    // Agregar jugador
    // ============================
    addPlayer(playerId: number) {
        return this.api.post(`/fantasy/add-player/${playerId}`, {});
    }

    // ============================
    // Eliminar jugador
    // ============================
    removePlayer(playerId: number) {
        return this.api.delete(`/fantasy/remove-player/${playerId}`);
    }

    // ============================
    // Ranking global
    // ============================
    getRanking() {
        return this.api.get<any[]>('/fantasy/ranking');
    }
}
