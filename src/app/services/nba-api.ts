import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NbaApiService {
  private apiUrl = 'https://v2.nba.api-sports.io';
  private headers = new HttpHeaders({
    'x-apisports-key': '501808e70ab941cc1ee0b21cd8a951dc'
  });

  constructor(private http: HttpClient) { }

  // Equipos
  async getTeams() {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/teams`,
        { headers: this.headers })
    );
    return response.response;
  }

  // Partidos por fecha
  async getGamesByDate(dateISO: string) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games?season=2025&date=${dateISO}`,
        { headers: this.headers }
      )
    );
    console.log(response.response)
    return response.response; // array
  }

  async getGamesByTeam(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games?season=2025&team=${teamId}`,
        { headers: this.headers }
      )
    );
    console.log(response.response)
    return response.response; // array
  }

  async getLiveGames() {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/games?live=all`, {
        headers: this.headers
      })
    );
    console.log('Live games:', response.response);
    return response.response;
  }

  async getPlayer(playerId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?id=${playerId}`,
        { headers: this.headers }
      )
    );
    console.log("players", response.response);
    return response.response
  }

  // Jugadores por equipo
  async getPlayersByTeam(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?team=${teamId}&season=2025`,
        { headers: this.headers }
      )
    );
    return response.response;
  }

  async getPlayersByLastName(playerName: String) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?name=${playerName}`,
        { headers: this.headers }
      )
    );
    console.log("players by name", response.response);
    return response.response
  }

  async getPlayersByCountry(country: String) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?country=${country}`,
        { headers: this.headers }
      )
    );
    console.log("players by country", response.response);
    return response.response
  }

  async getPlayersFiltered(filters: {
  name?: string;
  teamId?: number;
  country?: string;
  search?: string;
}) {
  let url = `${this.apiUrl}/players`;

  const params: string[] = [];

  // 🔹 Caso especial: si hay team → siempre agregamos la season
  if (filters.teamId) {
    params.push(`season=2025`);
    params.push(`team=${filters.teamId}`);
  }

  // 🔹 Filtros específicos
  if (filters.name) params.push(`name=${filters.name}`);
  if (filters.country) params.push(`country=${filters.country}`);
  if (filters.search) params.push(`search=${filters.search}`);

  // 🔹 Armamos la URL final con los parámetros unidos por "&"
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  console.log("➡️ Llamando a:", url);

  const response = await firstValueFrom(
    this.http.get<any>(url, { headers: this.headers })
  );

  return response.response;
}



  async getPlayerStats(playerId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players/statistics?id=${playerId}&season=2025`,
        { headers: this.headers }
      )
    );
    console.log("player data: ", response.response);
    return response.response;
  }

  async getGameData(gameId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games/statistics?id=${gameId}`,
        { headers: this.headers }
      )
    );
    console.log(response.response);
    return response.response;
  }

  async getPlayerStatsByGame(gameId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players/statistics?game=${gameId}`,
        { headers: this.headers }
      )
    );
    console.log(response.response);
    return response.response;
  }

  async getHeadToHead(firstTeam: number, secondTeam: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games?h2h=${firstTeam}-${secondTeam}`,
        { headers: this.headers }
      )
    );
    console.log(response.response);
    return response.response;
  }
}