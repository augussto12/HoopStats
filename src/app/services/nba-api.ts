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
    console.log(response.response);
    return response.response;
  }

  // Jugadores por equipo
  async getPlayersByTeam(teamId: number) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/players?team=${teamId}&season=2024`,
        { headers: this.headers }
      )
    );
    return response.response;
  }

  // Partidos por fecha
  async getGamesByDate(date: string) {
    const response = await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/games?date=${date}`,
        { headers: this.headers }
      )
    );
    return response.response;
  }
}
