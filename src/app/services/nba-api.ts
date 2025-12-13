import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../api.config';
import { Team } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class NbaApiService {

  private apiUrl = `${apiConfig.apiUrl}/nba`;

  constructor(private http: HttpClient) { }

  // Equipos
  async getTeams() {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/teams`)
    );
    return response.response;
  }

  async getTeamById(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/teams`, {
        params: { id: teamId }
      })
    );
    return response.response[0] as Team;
  }

  // Partidos por fecha
  async getGamesByDate(dateISO: string) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games`,
        { params: { season: 2025, date: dateISO } }
      )
    );
    return response.response;
  }

  // Partidos por equipo
  async getGamesByTeam(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games`,
        { params: { season: 2025, team: teamId } }
      )
    );
    return response.response;
  }

  async getLiveGames() {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/games`, {
        params: { live: 'all' }
      })
    );
    return response.response;
  }

  async getPlayer(playerId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players`,
        { params: { id: playerId } }
      )
    );
    return response.response;
  }

  async getPlayersByTeam(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players`,
        { params: { team: teamId, season: 2025 } }
      )
    );
    return response.response;
  }

  async getPlayersFiltered(filters: {
    name?: string;
    teamId?: number;
    country?: string;
    search?: string;
  }) {
    const params: any = {};

    if (filters.teamId) {
      params.season = 2025;
      params.team = filters.teamId;
    }
    if (filters.name) params.name = filters.name;
    if (filters.country) params.country = filters.country;
    if (filters.search) params.search = filters.search;

    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/players`, { params })
    );

    return response.response;
  }

  async getPlayerStats(playerId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players/statistics`,
        { params: { id: playerId, season: 2025 } }
      )
    );
    return response.response;
  }

  async getGameStats(gameId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games/statistics`,
        { params: { id: gameId } }
      )
    );
    return response.response;
  }

  async getGameData(gameId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games`,
        { params: { id: gameId } }
      )
    );
    return response.response;
  }

  async getPlayerStatsByGame(gameId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players/statistics`,
        { params: { game: gameId } }
      )
    );
    return response.response;
  }

  async getHeadToHead(firstTeam: number, secondTeam: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games`,
        { params: { h2h: `${firstTeam}-${secondTeam}` } }
      )
    );
    return response.response;
  }

  async getTeamStats(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/teams/statistics`,
        { params: { id: teamId, season: 2025, stage: 2 } }
      )
    );
    return response;
  }

  async getStandings() {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/standings`,
        { params: { league: 'standard', season: 2025 } }
      )
    );
    return response.response;
  }
}
