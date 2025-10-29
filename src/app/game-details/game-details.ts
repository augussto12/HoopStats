import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NbaApiService } from '../services/nba-api';

interface PlayerGroup {
  team: any;
  players: any[];
}

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.css']
})


export class GameDetails implements OnInit {
  gameDetails: any[] = [];
  groupedPlayers: any[] = [];
  loading = false;
  error: string | null = null;
  view: 'game' | 'players' = 'game';



  constructor(
    private route: ActivatedRoute,
    private api: NbaApiService
  ) { }


  statList = [
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

    this.loading = true;
    try {
      const data = await this.api.getGameData(id);

      if (data && data.length > 0) {
        this.gameDetails = data;
        console.log('Partido cargado:', this.gameDetails);
        await this.loadPlayerStats(id);
      } else {
        this.error = 'No se encontró información del partido.';
      }
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los datos del partido.';
    } finally {
      this.loading = false;
    }
  }

  async loadPlayerStats(gameId: number) {
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