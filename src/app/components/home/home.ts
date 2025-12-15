import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbaApiService } from '../../services/nba-api';
import { BestPlayersService } from '../../services/best-players.service';
import { mapGame } from '../../utils/mapGame';
import { getGamesByDateMapped } from '../../utils/gameUtils';
import { Game, MappedGame, NotificationItem, TopStat } from '../../models/interfaces';
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

  nextGames: MappedGame[] = [];
  errorNext: string | null = null;

  notifications: NotificationItem[] = [];
  unreadCount = 0;

  errorLive: string | null = null;
  errorPlayers: string | null = null;

  private nbaService = inject(NbaApiService);
  private bestPlayersService = inject(BestPlayersService);
  public auth = inject(AuthService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.loadLiveGames();
    this.loadBestPlayers();
    this.loadNextGames();
    if (this.auth.getToken()) this.loadNotifications();
  }

  async loadNotifications() {
    try {
      this.notifications = await this.notificationService.getNotifications();
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
    } catch (err) {
      console.error("Error loading notifications", err);
    }
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
      } else {
        this.errorLive = null;
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
      } else {
        this.errorPlayers = null;
      }
    } catch {
      this.errorPlayers = 'Error al obtener los mejores jugadores.';
    }
  }

  async loadNextGames() {
    this.errorNext = null;

    try {
      const todayStr = this.toYYYYMMDD(new Date());

      const gamesToday = await getGamesByDateMapped(this.nbaService, todayStr);

      const upcoming = gamesToday
        .filter(g => g.status === 'Programado')
        .sort((a, b) => a.id - b.id);

      this.nextGames = upcoming.slice(0, 8);

      this.errorNext =
        this.nextGames.length ? null : 'No hay próximos partidos por mostrar.';

    } catch (err) {
      console.error(err);
      this.errorNext = 'Error al cargar próximos partidos.';
    }
  }

  private toYYYYMMDD(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }


  onImageError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/news-placeholder.jpg';
  }

  trackNextGame(index: number, g: any) {
    return g.id ?? g.game_id ?? index;
  }

}
