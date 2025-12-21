import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FantasyService {
    constructor(private api: ApiService) { }

    getMyTeam() {
        return this.api.get<any>('/fantasy/my-team');
    }

    createTeam(name: string) {
        return this.api.post('/fantasy/create', { name });
    }

    updateName(name: string) {
        return this.api.put('/fantasy/update-name', { name });
    }

    addPlayer(playerId: number) {
        return this.api.post(`/fantasy/add-player/${playerId}`, {});
    }

    removePlayer(playerId: number) {
        return this.api.delete(`/fantasy/remove-player/${playerId}`);
    }

    applyTrades(add: number[], drop: number[]) {
        return this.api.post('/fantasy/apply-trades', { add, drop });
    }

    getTradesToday(): Promise<{
        teamId: number;
        tradesHoy: number;
        tradesRestantes: number;
        limiteDiario: number;
    }> {
        return this.api.get('/fantasy/trades/today');
    }

    getMyTransactions() {
        return this.api.get('/fantasy/trades/history');
    }

    getGroupedTransactionsByTeam(teamId: number) {
        return this.api.get<any[]>(`/fantasy-trades/team/${teamId}/trades`);
    }

    getRanking() {
        return this.api.get('/fantasy/ranking');
    }

    getWeeklyDreamTeam() {
        return this.api.get<any[]>('/best-players/dream-team');
    }

    setCaptain(teamId: number, playerId: number) {
        return this.api.post(`/fantasy/set-captain`, { teamId, playerId });
    }
}
