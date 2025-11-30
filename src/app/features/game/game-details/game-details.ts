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

  public gameDetails: any[] = [];
  public groupedPlayers: PlayerGroup[] = [];
  public error: string | null = null;
  public view: 'game' | 'players' = 'game';

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
      const data = await this.api.getGameStats(id);

      if (!data || data.length === 0) {
        this.error = 'No se encontró información del partido.';
        return;
      }

      this.gameDetails = data;
      await this.loadPlayerStats(id);

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
}
