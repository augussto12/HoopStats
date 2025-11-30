import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AdminLeagueResponse, League, MyCreatedLeague, MyLeague } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class FantasyLeaguesService {

    constructor(private api: ApiService) { }

    // ──────────────────────────────────────────────
    //                     LIGAS
    // ──────────────────────────────────────────────

    createLeague(name: string, privacy: 'public' | 'private', description: string | null, maxTeams: number | null) {
        return this.api.post('/fantasy-leagues', { name, privacy, description, maxTeams });
    }

    deleteLeague(leagueId: number) {
        return this.api.delete(`/fantasy-leagues/${leagueId}`);
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

    getLeaguesWhereImAdmin() {
        return this.api.get<any[]>(`/fantasy-leagues/admin-leagues`);
    }

    getLeagueDetails(id: number) {
        return this.api.get<any>(`/fantasy-leagues/league-details/${id}`);
    }

    getMyInvites(): Promise<any[]> {
        return this.api.get('/fantasy-league-membership/my/invites');
    }

    getAllLeagues() {
        return this.api.get<League[]>('/fantasy-leagues/all');
    }

    requestJoinLeague(leagueId: number) {
        return this.api.post(`/fantasy-league-membership/leagues/${leagueId}/request-join`, {});
    }

    isMemberOfLeague(leagueId: number) {
        return this.api.get(`/fantasy-league-membership/is-member/${leagueId}`);
    }

    leaveLeague(leagueId: number) {
        return this.api.post(`/fantasy-leagues/leagues/${leagueId}/leave`, {});
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
        return this.api.get(`/fantasy-trades/${leagueId}/trades`);
    }

    getLeagueMarket(leagueId: number) {
        return this.api.get(`/fantasy-trades/${leagueId}/market`);
    }
}
