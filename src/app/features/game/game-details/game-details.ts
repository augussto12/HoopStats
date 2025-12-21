import { Component, Injector, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NbaApiService } from '../../../services/nba-api';
import { PlayerGroup } from '../../../models/interfaces';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.css']
})
export class GameDetails implements OnInit {


  public activeTeamIndex: number = 0;
  public gameDetails: any[] = [];
  public groupedPlayers: PlayerGroup[] = [];
  public error: string | null = null;
  public view: 'game' | 'players' = 'game';

  // NUEVAS PROPIEDADES PARA EL MARCADOR Y LÍDERES
  public scoreBoard: any = null;
  public gameLeaders: any[] = [];
  public activeLeaderTab: 'points' | 'assists' | 'rebounds' = 'points';

  private route = inject(ActivatedRoute);
  private api = inject(NbaApiService);


  constructor() { }

  public readonly statList = [
    { key: 'points', label: 'Puntos' },
    { key: 'assists', label: 'Asistencias' },
    { key: 'blocks', label: 'Bloqueos' },
    { key: 'defReb', label: 'Rebotes defensivos' },
    { key: 'offReb', label: 'Rebotes ofensivos' },
    { key: 'totReb', label: 'Rebotes totales' },
    { key: 'fgm', label: 'Tiros convertidos' },
    { key: 'fga', label: 'Tiros intentados' },
    { key: 'fgp', label: 'Porcentaje de campo (%)' },
    { key: 'ftm', label: 'Tiros libres encestados' },
    { key: 'fta', label: 'Tiros libres intentados' },
    { key: 'ftp', label: 'Porcentaje libres (%)' },
    { key: 'steals', label: 'Robos' },
    { key: 'turnovers', label: 'Pérdidas' },
    { key: 'pFouls', label: 'Faltas personales' }
  ];

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Partido no encontrado.';
      return;
    }

    try {
      // 1. Cargamos estadísticas generales del equipo
      this.gameDetails = await this.api.getGameStats(id);

      // 2. Cargamos el Marcador (Linescore) usando tu método getGameData
      const gameInfo = await this.api.getGameData(id);
      if (gameInfo && gameInfo.length > 0) {
        this.scoreBoard = gameInfo[0];
      }

      // 3. Cargamos jugadores y calculamos líderes
      await this.loadPlayerStats(id);
      this.calculateLeaders();

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los datos del partido.';
    }
  }

  private async loadPlayerStats(gameId: number) {
    const stats = await this.api.getPlayerStatsByGame(gameId);
    const grouped = stats.reduce((acc: Record<number, PlayerGroup>, s: any) => {
      const teamId = s.team.id;
      if (!acc[teamId]) {
        acc[teamId] = { team: s.team, players: [] };
      }
      acc[teamId].players.push(s);
      return acc;
    }, {});
    this.groupedPlayers = Object.values(grouped);
  }

  // Lógica para encontrar al mejor de cada equipo según el Tab seleccionado
  private calculateLeaders() {
    if (this.groupedPlayers.length < 2) return;

    this.gameLeaders = this.groupedPlayers.map(teamGroup => {
      return {
        team: teamGroup.team,
        points: [...teamGroup.players].sort((a, b) => b.points - a.points)[0],
        rebounds: [...teamGroup.players].sort((a, b) => b.totReb - a.totReb)[0],
        assists: [...teamGroup.players].sort((a, b) => b.assists - a.assists)[0]
      };
    });
  }
}
