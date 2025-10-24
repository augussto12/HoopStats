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
      this.http.get<any>(`${this.apiUrl}/teams`, { headers: this.headers })
    );
    return response.response;
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

  // Partidos por fecha
  async getGamesByDate(dateISO: string) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games?season=2025&date=${dateISO}`,
        { headers: this.headers }
      )
    );
    return response.response; // array
  }

  async getPlayer(playerId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?id=${playerId}`,
        { headers: this.headers }
      )
    );
    console.log("players",response.response);
    return response.response
  }

  async getPlayerStats(playerId: number){
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players/statistics?id=${playerId}&season=2025`,
        {headers: this.headers}
      )
    );
    console.log("player data: ",response.response);
    return response.response;
  }
}
