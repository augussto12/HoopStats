import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbaApiService } from '../services/nba-api';
import { mapGame } from '../utils/mapGame';
import { Game, TopStat, PlayerStats } from '../utils/interfaces';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../Games/games.css']
})
export class Home implements OnInit {
  liveGames: Game[] = [];
  bestPlayers: TopStat[] = [];
  loadingLive = false;
  loadingPlayers = false;
  errorLive: string | null = null;
  errorPlayers: string | null = null;

  private statsCache = new Map<number, PlayerStats[]>();

  constructor(private nbaService: NbaApiService, public auth: AuthService) { }

  async ngOnInit() {
    this.loadLiveGames();
    this.loadBestPlayersYesterday();
  }

  async loadLiveGames() {
    this.loadingLive = true;
    try {
      const live = await this.nbaService.getLiveGames();
      if (live && live.length > 0) {
        this.liveGames = live.map(mapGame) as Game[];
      } else {
        this.errorLive = 'No hay partidos en vivo actualmente.';
      }
    } catch (err) {
      console.error(err);
      this.errorLive = 'Error al cargar los partidos en vivo.';
    } finally {
      this.loadingLive = false;
    }
  }

  private pad(n: number) {
    return String(n).padStart(2, '0');
  }

  private toLocalYYYYMMDD(d: Date) {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private addDays(dateISO: string, delta: number) {
    const d = new Date(dateISO + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return this.toLocalYYYYMMDD(d);
  }

  async loadBestPlayersYesterday() {
    this.loadingPlayers = true;
    try {
      const todayUTC = new Date();
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);

      const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];


      const gamesYesterday = await this.nbaService.getGamesByDate(yesterdayStr);
      const finishedGames = gamesYesterday.filter(
        (g: Game) =>
          g.status?.short === 'FT' ||
          g.status?.long === 'Finished' ||
          g.status?.long === 'Final'
      );

      if (finishedGames.length === 0) {
        this.errorPlayers = 'Aún no hay estadísticas disponibles del día anterior.';
        this.loadingPlayers = false;
        return;
      }

      const statsPromises = finishedGames.map(async (g: Game) => {
        if (this.statsCache.has(g.id)) {
          return this.statsCache.get(g.id)!;
        }

        try {
          const stats = await this.nbaService.getPlayerStatsByGame(g.id);
          this.statsCache.set(g.id, stats || []);
          return stats || [];
        } catch (err) {
          console.warn(`Error obteniendo stats del juego ${g.id}`, err);
          return [];
        }
      });

      const allResults = await Promise.all(statsPromises);
      const allStats: PlayerStats[] = allResults.flat();

      if (allStats.length === 0) {
        this.errorPlayers = 'No se encontraron estadísticas para los partidos de ayer.';
        this.loadingPlayers = false;
        return;
      }

      const topStats = {
        pts: { player: '', value: 0 },
        reb: { player: '', value: 0 },
        ast: { player: '', value: 0 },
        blk: { player: '', value: 0 },
        stl: { player: '', value: 0 },
        '3pm': { player: '', value: 0 }
      };

      for (const s of allStats) {
        const name = `${s.player.firstname} ${s.player.lastname}`;
        if (s.points > topStats.pts.value) topStats.pts = { player: name, value: s.points };
        if (s.totReb > topStats.reb.value) topStats.reb = { player: name, value: s.totReb };
        if (s.assists > topStats.ast.value) topStats.ast = { player: name, value: s.assists };
        if (s.blocks > topStats.blk.value) topStats.blk = { player: name, value: s.blocks };
        if (s.steals > topStats.stl.value) topStats.stl = { player: name, value: s.steals };
        if (s.tpm > topStats['3pm'].value)
          topStats['3pm'] = { player: name, value: s.tpm };
      }

      this.bestPlayers = [
        { category: 'Puntos', player: topStats.pts.player, value: topStats.pts.value },
        { category: 'Rebotes', player: topStats.reb.player, value: topStats.reb.value },
        { category: 'Asistencias', player: topStats.ast.player, value: topStats.ast.value },
        { category: 'Tapones', player: topStats.blk.player, value: topStats.blk.value },
        { category: 'Robos', player: topStats.stl.player, value: topStats.stl.value },
        { category: 'Triples', player: topStats['3pm'].player, value: topStats['3pm'].value }
      ];

    } catch (err) {
      console.error(err);
      this.errorPlayers = 'Error al obtener los jugadores destacados.';
    } finally {
      this.loadingPlayers = false;
    }
  }
}
