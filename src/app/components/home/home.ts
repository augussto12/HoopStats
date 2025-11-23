import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NbaApiService } from '../../services/nba-api';
import { BestPlayersService } from '../../services/best-players.service';

import { NEWS } from '../../data/news';
import { mapGame } from '../../utils/mapGame';
import { Game, TopStat } from '../../models/interfaces';
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
  news = NEWS;

  loadingLive = false;
  loadingPlayers = false;

  errorLive: string | null = null;
  errorPlayers: string | null = null;

  constructor(
    private nbaService: NbaApiService,
    private bestPlayersService: BestPlayersService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.loadLiveGames();
    this.loadBestPlayers();
  }

  openNews(url: string) {
    window.open(url, '_blank');
  }

  trackNews(index: number, item: any) {
    return item.title;
  }

  trackGame(index: number, game: Game) {
    return game.id;
  }

  trackPlayers(index: number, item: TopStat) {
    return item.category;
  }

  async loadLiveGames() {
    this.loadingLive = true;

    try {
      const live = await this.nbaService.getLiveGames();
      this.liveGames = live?.length ? live.map(mapGame) : [];
      if (!this.liveGames.length) this.errorLive = 'No hay partidos en vivo actualmente.';
    } catch {
      this.errorLive = 'Error al cargar los partidos en vivo.';
    } finally {
      this.loadingLive = false;
    }
  }

  async loadBestPlayers() {
    this.loadingPlayers = true;

    try {
      const data = await this.bestPlayersService.getLatest();
      this.bestPlayers = data.players || [];

      if (!this.bestPlayers.length) {
        this.errorPlayers = 'No se pudieron cargar los jugadores destacados.';
      }

    } catch {
      this.errorPlayers = 'Error al obtener los mejores jugadores.';
    } finally {
      this.loadingPlayers = false;
    }
  }
}
