import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbaApiService } from '../../services/nba-api';
import { BestPlayersService } from '../../services/best-players.service';
import { mapGame } from '../../utils/mapGame';
import { getGamesByDateMapped } from '../../utils/gameUtils';
import { Game, MappedGame, NotificationItem, TopStat } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FantasyService } from '../../services/fantasy-service';
import { NbaInjuriesService } from '../../services/nba-injuries.service';

export interface InjuryPlayer {
  name: string;
  position?: string;
  status: string;
  statusType?: string;
  updated?: string;
  reason: string;
}

export interface InjuryGroup {
  team: string;
  players: InjuryPlayer[];
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../../features/game/games/games.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {

  liveGames: Game[] = [];
  bestPlayers: TopStat[] = [];
  dreamTeam: any[] = [];

  nextGames: MappedGame[] = [];
  errorNext: string | null = null;

  notifications: NotificationItem[] = [];
  unreadCount = 0;

  errorLive: string | null = null;
  errorPlayers: string | null = null;
  injuryGroups: InjuryGroup[] = [];
  currentInjuryIndex = 0;
  errorInjuries: string | null = null;
  loadingInjuries = false;
  showInjuryModal = false;

  private nbaService = inject(NbaApiService);
  private bestPlayersService = inject(BestPlayersService);
  public auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fantasyService = inject(FantasyService);
  private injuriesService = inject(NbaInjuriesService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadLiveGames();
    this.loadBestPlayers();
    this.loadNextGames();
    this.loadDreamTeam();
    this.loadInjuryReport();
    if (this.auth.getToken()) this.loadNotifications();
  }

  async loadNotifications() {
    try {
      this.notifications = await this.notificationService.getNotifications();
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
      this.cdr.markForCheck();
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

  trackInjuryGroup(index: number, group: InjuryGroup) {
    return group.team;
  }

  trackInjuryPlayer(index: number, player: InjuryPlayer) {
    return player.name;
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
    } finally {
      this.cdr.markForCheck();
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
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadNextGames() {
    this.errorNext = null;

    try {
      const todayStr = this.toYYYYMMDD(new Date());
      const gamesToday = await getGamesByDateMapped(this.nbaService, todayStr);

      const upcoming = gamesToday
        .filter(g => g.status === 'Programado')
        .sort((a, b) => {
          const dateA = new Date(`${a.dateISO} ${a.timeLocal}`).getTime();
          const dateB = new Date(`${b.dateISO} ${b.timeLocal}`).getTime();

          return dateA - dateB;
        });

      this.nextGames = upcoming; // Máximo 5 próximos partidos
      this.errorNext = this.nextGames.length ? null : 'No hay próximos partidos por mostrar.';

    } catch (err) {
      console.error("Error al ordenar:", err);
      this.errorNext = 'Error al cargar próximos partidos.';
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadDreamTeam() {
    try {
      const data = await this.fantasyService.getWeeklyDreamTeam();
      this.dreamTeam = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error cargando Dream Team:", err);
      this.dreamTeam = [];
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadInjuryReport() {
    this.loadingInjuries = true;
    this.errorInjuries = null;
    this.cdr.markForCheck();
    try {
      const resp = await this.injuriesService.getInjuryReport();
      if (resp.success) {
        this.injuryGroups = resp.data;
      } else {
        this.errorInjuries = 'No se pudo cargar el reporte de lesiones.';
      }
    } catch (err) {
      console.error("Error al cargar reporte de lesiones:", err);
      this.errorInjuries = 'Error al conectar con el servidor.';
    } finally {
      this.loadingInjuries = false;
      this.cdr.detectChanges();
    }
  }

  get currentInjuryGroup(): InjuryGroup | null {
    return this.injuryGroups.length > 0 ? this.injuryGroups[this.currentInjuryIndex] : null;
  }

  nextInjuryTeam() {
    if (this.injuryGroups.length === 0) return;
    this.currentInjuryIndex = (this.currentInjuryIndex + 1) % this.injuryGroups.length;
    this.cdr.detectChanges();
  }

  prevInjuryTeam() {
    if (this.injuryGroups.length === 0) return;
    this.currentInjuryIndex = (this.currentInjuryIndex - 1 + this.injuryGroups.length) % this.injuryGroups.length;
    this.cdr.detectChanges();
  }

  openInjuryModal() {
    this.showInjuryModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
    this.cdr.detectChanges();
  }

  closeInjuryModal() {
    this.showInjuryModal = false;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
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
