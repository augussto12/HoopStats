import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbaApiService } from '../../services/nba-api';
import { mapGame } from '../../utils/mapGame';
import { Game, TopStat, PlayerStats } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../../features/game/games/games.css']
})
export class Home implements OnInit {

  liveGames: Game[] = [];
  bestPlayers: TopStat[] = [];

  menuOpen: boolean = false;


  news = [
  {
    image: 'https://ds-images.bolavip.com/news/image?src=https%3A%2F%2Fimages.bolavip.com%2Fwebp%2Fmx%2Ffull%2FBMX_20251120_BMX_390380_Lakers-despidio-a-dos-piezas-del-equipo-de-LeBron-y-compania.webp&width=490&height=275',
    title: 'Ni LeBron lo esperaba: Lakers corta a dos de las piezas más importantes del equipo en plena temporada',
    description: 'Los Angeles Lakers tomaron una decisión que nadie veía venir en la NBA cortando a dos piezas clave del equipo. ¡Ni LeBron James lo esperaba!',
    url: 'https://bolavip.com/mx/amp/nba/ni-lebron-lo-esperaba-lakers-corta-a-dos-de-las-piezas-mas-importantes-del-equipo-en-plena-temporada'
  },
  {
    image: 'https://statics.ciudadano.news/2025/11/crop/691f65d262e3a__980x490.webp?v=1763665411',
    title: 'NBA HOY: qué partidos se juegan este jueves 20 de noviembre de 2025',
    description: 'La NBA continúa este jueves con cuatro partidos desde las 21:00 en Argentina. Revisá todos los duelos del día y dónde verlos.',
    url: 'https://ciudadano.news/deportes/nba-hoy-partidos-juegan-jueves-20-noviembre-2025-n112090'
  }

];


  loadingLive = false;
  loadingPlayers = false;

  errorLive: string | null = null;
  errorPlayers: string | null = null;


  private statsCache = new Map<number, PlayerStats[]>();

  constructor(
    private nbaService: NbaApiService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadLiveGames();
    this.loadBestPlayersYesterday();
  }

  openNews(url: string) {
  window.open(url, '_blank');
}



  async loadLiveGames() {
    this.loadingLive = true;
    this.errorLive = null;

    try {
      const live = await this.nbaService.getLiveGames();

      this.liveGames = live?.length ? live.map(mapGame) : [];

      if (!this.liveGames.length) {
        this.errorLive = 'No hay partidos en vivo actualmente.';
      }
    } catch (err) {
      console.error(err);
      this.errorLive = 'Error al cargar los partidos en vivo.';
    } finally {
      this.loadingLive = false;
    }
  }

  private getYesterdayISO(): string {
    const d = new Date();
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  }


  private async getStatsForGame(gameId: number): Promise<PlayerStats[]> {
    if (this.statsCache.has(gameId)) {
      return this.statsCache.get(gameId)!;
    }

    try {
      const stats = await this.nbaService.getPlayerStatsByGame(gameId);
      this.statsCache.set(gameId, stats || []);
      return stats || [];
    } catch (err) {
      console.warn(`Error obteniendo stats del juego ${gameId}`, err);
      return [];
    }
  }

  private computeTopStats(all: PlayerStats[]): TopStat[] {
    const top = {
      pts: { player: '', value: 0 },
      reb: { player: '', value: 0 },
      ast: { player: '', value: 0 },
      blk: { player: '', value: 0 },
      stl: { player: '', value: 0 },
      pm3: { player: '', value: 0 }
    };

    for (const s of all) {
      const name = `${s.player.firstname} ${s.player.lastname}`;

      if (s.points > top.pts.value) top.pts = { player: name, value: s.points };
      if (s.totReb > top.reb.value) top.reb = { player: name, value: s.totReb };
      if (s.assists > top.ast.value) top.ast = { player: name, value: s.assists };
      if (s.blocks > top.blk.value) top.blk = { player: name, value: s.blocks };
      if (s.steals > top.stl.value) top.stl = { player: name, value: s.steals };
      if (s.tpm > top.pm3.value) top.pm3 = { player: name, value: s.tpm };
    }

    return [
      { category: 'Puntos', player: top.pts.player, value: top.pts.value },
      { category: 'Rebotes', player: top.reb.player, value: top.reb.value },
      { category: 'Asistencias', player: top.ast.player, value: top.ast.value },
      { category: 'Tapones', player: top.blk.player, value: top.blk.value },
      { category: 'Robos', player: top.stl.player, value: top.stl.value },
      { category: 'Triples', player: top.pm3.player, value: top.pm3.value }
    ];
  }

  async loadBestPlayersYesterday() {
    this.loadingPlayers = true;
    this.errorPlayers = null;

    try {
      const yesterdayStr = this.getYesterdayISO();

      const gamesYesterday: Game[] = await this.nbaService.getGamesByDate(yesterdayStr);

      if (!gamesYesterday.length) {
        this.errorPlayers = 'No hubo partidos ayer.';
        return;
      }

      const finishedGames = gamesYesterday.filter(
        (g: Game) =>
          g.status?.short === 'FT' ||
          g.status?.long === 'Finished' ||
          g.status?.long === 'Final'
      );

      if (!finishedGames.length) {
        this.errorPlayers = 'Aún no hay estadísticas disponibles del día anterior.';
        return;
      }

      const statsArrays = await Promise.all(
        finishedGames.map(g => this.getStatsForGame(g.id))
      );

      const allStats = statsArrays.flat();

      if (!allStats.length) {
        this.errorPlayers = 'No se encontraron estadísticas para los partidos de ayer.';
        return;
      }

      this.bestPlayers = this.computeTopStats(allStats);

    } catch (err) {
      console.error(err);
      this.errorPlayers = 'Error al obtener los jugadores destacados.';
    } finally {
      this.loadingPlayers = false;
    }
  }
}
