import { Component, OnInit, Injector, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NbaApiService } from '../../../services/nba-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { mapGame } from '../../../utils/mapGame';
import { FavoritesService } from '../../../services/favorites-service';
import { Team } from '../../../models/interfaces';
import { AuthService } from '../../../services/auth.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-players-by-team',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './players-by-team.html',
  styleUrls: ['./players-by-team.css', '../../game/games/games.css']
})
export class PlayersByTeam implements OnInit {

  public teamId!: number;
  public team: Team | null = null;
  public players: any[] = [];
  public games: any[] = [];
  public gamesShown: any[] = [];
  public streak: string[] = [];
  public stats: any = null;
  public favoritesPlayersIds: number[] = [];

  public selectedView: 'players' | 'games' | 'stats' = 'players';
  public selectedStatus = '';

  public error: string | null = null;

  private route = inject(ActivatedRoute);
  private nbaService = inject(NbaApiService);
  private favService = inject(FavoritesService);
  public auth = inject(AuthService);

  constructor(public injector: Injector) { }

  async ngOnInit() {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.teamId) {
      this.error = "ID de equipo inválido.";
      return;
    }

    try {
      await this.loadAllData();
    } catch (e) {
      console.error(e);
      this.error = "Hubo un problema cargando la información del equipo.";
    }
  }

  private async loadAllData() {
    await this.loadTeam(this.teamId);
    await this.loadPlayers(this.teamId);
    await this.loadGames(this.teamId);

    if (this.auth.isLoggedIn()) {
      try {
        const favorites = await this.favService.getFavorites();
        this.favoritesPlayersIds = favorites.players.map((p: any) => p.id);
      } catch {
        console.warn("No se pudieron cargar los favoritos.");
      }
    }
  }

  async loadTeam(teamId: number) {
    this.team = await this.nbaService.getTeamById(teamId);
  }

  async loadPlayers(teamId: number) {
    this.players = await this.nbaService.getPlayersByTeam(teamId);
  }

  async loadGames(teamId: number) {
    try {
      const response = await this.nbaService.getGamesByTeam(teamId);

      const regularSeasonGames = response.filter((g: any) => g.stage === 2);
      const mapped = regularSeasonGames.map((g: any) => mapGame(g));

      this.games = mapped;
      this.applyFilter();
      this.streak = this.getStreak(teamId);
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los partidos.';
    }
  }

  async onViewChange() {
    if (this.selectedView === 'games' && this.games.length === 0) {
      await this.loadGames(this.teamId);
    }

    if (this.selectedView === 'stats' && !this.stats) {
      await this.loadStats(this.teamId);
    }
  }

  applyFilter() {
    if (!this.selectedStatus) {
      this.gamesShown = this.games;
      return;
    }

    switch (this.selectedStatus) {
      case 'Finished':
        this.gamesShown = this.games.filter(g => g.status === 'Final');
        break;
      case 'Live':
        this.gamesShown = this.games.filter(g => g.status === 'LIVE');
        break;
      case 'Scheduled':
        this.gamesShown = this.games.filter(g => g.status === 'Programado');
        break;
      default:
        this.gamesShown = this.games;
    }
  }

  getStreak(teamId: number): string[] {
    if (!this.games?.length) return [];

    const finished = this.games.filter((g: any) => g.status === 'Final');
    if (!finished.length) return [];

    const lastFive = finished.slice(-5).reverse();

    return lastFive.map((g: any) => {
      const isHome = g.home.id === teamId;
      const ptsOwn = isHome ? g.home.pts : g.visitors.pts;
      const ptsOpp = isHome ? g.visitors.pts : g.home.pts;
      return ptsOwn > ptsOpp ? 'W' : 'L';
    });
  }

  async loadStats(teamId: number) {
    try {
      const response = await this.nbaService.getTeamStats(teamId);
      if (!response?.response?.length) return;

      const data = response.response[0];
      const games = data.games;

      this.stats = {
        games,
        points: (data.points / games).toFixed(1),
        fgm: (data.fgm / games).toFixed(1),
        fga: (data.fga / games).toFixed(1),
        fgp: data.fgp,
        ftm: (data.ftm / games).toFixed(1),
        fta: (data.fta / games).toFixed(1),
        ftp: data.ftp,
        tpm: (data.tpm / games).toFixed(1),
        tpa: (data.tpa / games).toFixed(1),
        tpp: data.tpp,
        assists: (data.assists / games).toFixed(1),
        rebounds: (data.totReb / games).toFixed(1),
        steals: (data.steals / games).toFixed(1),
        blocks: (data.blocks / games).toFixed(1),
        turnovers: (data.turnovers / games).toFixed(1),
        fouls: (data.pFouls / games).toFixed(1),
        plusMinus: data.plusMinus
      };
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  }

  isFavorite(player: any): boolean {
    return this.favoritesPlayersIds.includes(player.id);
  }

  async addToFavorites(player: any) {
    if (this.isFavorite(player)) return;

    await this.favService.addFavorite('player', player.id);
    this.favoritesPlayersIds.push(player.id);
  }
}
