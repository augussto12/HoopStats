import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FantasyService {

    constructor(private api: ApiService) { }

    //        MI EQUIPO
    getMyTeam() {
        return this.api.get<{
            team: {
                id: number;
                name: string;
                total_points: number;
                budget: number;
                trades_remaining: number;
            } | null;
            players: any[];
        }>('/fantasy/my-team');
    }

    createTeam(name: string) {
        return this.api.post('/fantasy/create', { name });
    }

    updateName(name: string) {
        return this.api.put('/fantasy/update-name', { name });
    }

    //        TRADES INDIVIDUALES
    addPlayer(playerId: number) {
        return this.api.post(`/fantasy/add-player/${playerId}`, {});
    }

    removePlayer(playerId: number) {
        return this.api.delete(`/fantasy/remove-player/${playerId}`);
    }

    //        TRADES EN LOTE
    applyTrades(add: number[], drop: number[]) {
        return this.api.post('/fantasy/apply-trades', { add, drop });
    }

    //        LIMITES DE TRADES
    getTradesToday(): Promise<{
        teamId: number;
        tradesHoy: number;
        tradesRestantes: number;
        limiteDiario: number;
    }> {
        return this.api.get('/fantasy/trades/today');
    }


    //        HISTORIAL SIMPLE
    getMyTransactions() {
        return this.api.get('/fantasy/trades/history');
    }

    //        HISTORIAL COMBINADO
    getGroupedTransactionsByTeam(teamId: number) {
        return this.api.get<any[]>(`/fantasy-trades/team/${teamId}/trades`);
    }

    //        RANKING GLOBAL
    getRanking() {
        return this.api.get('/fantasy/ranking');
    }
}
