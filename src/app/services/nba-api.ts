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

  // Partidos por equipo
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

  //Partidos en vivo
  async getLiveGames() {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/games?live=all`, {
        headers: this.headers
      })
    );
    console.log('Live games:', response.response);
    return response.response;
  }

  //Traer jugador
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

  //Traer jugadores por filtros
  async getPlayersFiltered(filters: {
    name?: string;
    teamId?: number;
    country?: string;
    search?: string;
  }) {
    let url = `${this.apiUrl}/players`;

    const params: string[] = [];

    // Si hay equipo hay que mandar la temporada actual
    if (filters.teamId) {
      params.push(`season=2025`);
      params.push(`team=${filters.teamId}`);
    }


    if (filters.name) params.push(`name=${filters.name}`);
    if (filters.country) params.push(`country=${filters.country}`);
    if (filters.search) params.push(`search=${filters.search}`);

    // Se arma la url
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await firstValueFrom(
      this.http.get<any>(url, { headers: this.headers })
    );

    return response.response;
  }

  // Traer las estadisticas de un jugador
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

  // Traer los datos de un partido por su id
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

  // Obtener las estadisticas de un jugador por partido
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

  // Trae los partidos entre dos equipos
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

