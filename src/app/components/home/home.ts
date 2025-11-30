import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NbaApiService } from '../../services/nba-api';
import { BestPlayersService } from '../../services/best-players.service';

import { NEWS } from '../../data/news';
import { mapGame } from '../../utils/mapGame';
import { Game, NotificationItem, TopStat } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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

  notifications: NotificationItem[] = [];
  unreadCount = 0;

  errorLive: string | null = null;
  errorPlayers: string | null = null;

  constructor(
    private nbaService: NbaApiService,
    private bestPlayersService: BestPlayersService,
    public auth: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadLiveGames();
    this.loadBestPlayers();
    this.loadNotifications();
  }

  async loadNotifications() {
    try {
      this.notifications = await this.notificationService.getNotifications();
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
    } catch (err) {
      console.error("Error loading notifications", err);
    }
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
    try {
      const live = await this.nbaService.getLiveGames();
      this.liveGames = live?.length ? live.map(mapGame) : [];

      if (!this.liveGames.length) {
        this.errorLive = 'No hay partidos en vivo actualmente.';
      }

    } catch {
      this.errorLive = 'Error al cargar los partidos en vivo.';
    }
  }

  async loadBestPlayers() {
    try {
      const data = await this.bestPlayersService.getLatest();
      this.bestPlayers = Array.isArray(data) ? data : [];

      if (!this.bestPlayers.length) {
        this.errorPlayers = 'No se pudieron cargar los jugadores destacados.';
      }

    } catch {
      this.errorPlayers = 'Error al obtener los mejores jugadores.';
    }
  }
  onImageLoad(ev: Event) {
    (ev.target as HTMLImageElement).classList.add('img-loaded');
  }

  onImageError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/news-placeholder.jpg';
  }

}
