import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AdminLeagueResponse, MyCreatedLeague, MyLeague } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class FantasyLeaguesService {

    constructor(private api: ApiService) { }

    // ──────────────────────────────────────────────
    //                     LIGAS
    // ──────────────────────────────────────────────

    createLeague(name: string, privacy: 'public' | 'private', description?: string) {
        return this.api.post('/fantasy-leagues', { name, privacy, description });
    }

    getAdminStatus() {
        return this.api.get('/fantasy-leagues/my-admin-status');
    }

    updateLeague(leagueId: number, payload: any) {
        return this.api.put(`/fantasy-leagues/${leagueId}`, payload);
    }

    getMyLeagues(): Promise<MyLeague[]> {
        return this.api.get('/fantasy-leagues/my-leagues');
    }

    getMyCreatedLeagues(): Promise<MyCreatedLeague[]> {
        return this.api.get<MyCreatedLeague[]>('/fantasy-leagues/my-created-leagues');
    }

    // ✔ CORREGIDO
    getMyInvites(): Promise<any[]> {
        return this.api.get('/fantasy-league-membership/my/invites');
    }

    // ──────────────────────────────────────────────
    //                     EQUIPOS
    // ──────────────────────────────────────────────

    getLeagueTeams(leagueId: number) {
        return this.api.get(`/fantasy-leagues/${leagueId}/teams`);
    }

    getLeagueRanking(leagueId: number) {
        return this.api.get(`/fantasy-leagues/${leagueId}/ranking`);
    }

    getLeagueTeamTrades(teamId: number) {
        return this.api.get(`/fantasy-leagues/team/${teamId}/trades`);
    }

    getLeagueTrades(leagueId: number) {
        return this.api.get(`/fantasy-leagues/${leagueId}/trades`);
    }

    getLeagueMarket(leagueId: number) {
        return this.api.get(`/fantasy-leagues/${leagueId}/market`);
    }
}
