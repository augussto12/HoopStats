import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NbaApiService } from '../services/nba-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players-by-team',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './players-by-team.html',
  styleUrls: ['./players-by-team.css', '../games/games.css']
})
export class PlayersByTeam implements OnInit {
  teamId!: number;
  team: any;
  players: any[] = [];
  games: any[] = [];
  gamesShown: any[] = [];

  selectedView: 'players' | 'games' = 'players';
  selectedStatus = '';

  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private nbaService: NbaApiService
  ) { }

  async ngOnInit() {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.teamId) return;

    await this.loadTeam(this.teamId);
    await this.loadPlayers(this.teamId);
  }

  async loadTeam(teamId: number) {
    const allTeams = await this.nbaService.getTeams();
    this.team = allTeams.find((t: any) => t.id === teamId);
  }

  async loadPlayers(teamId: number) {
    this.players = await this.nbaService.getPlayersByTeam(teamId);
  }

  async loadGames(teamId: number) {
    this.loading = true;
    this.error = null;
    try {
      const response = await this.nbaService.getGamesByTeam(teamId);

      const regularSeasonGames = response.filter((g: any) => g.stage === 2);
      const mapped = regularSeasonGames.map((g: any) => this.mapGame(g));

      this.games = mapped;
      this.applyFilter();
    } catch (e) {
      this.error = 'Error al cargar los partidos.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }


  async onViewChange() {
    if (this.selectedView === 'games' && this.games.length === 0) {
      await this.loadGames(this.teamId);
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

  private mapGame(g: any) {
    const startUtc = g?.date?.start ? new Date(g.date.start) : null;
    const localDate = startUtc
      ? startUtc.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    const localTime = startUtc
      ? startUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';

    const statusShort = g?.status?.short;
    const statusLong = g?.status?.long ?? '';
    const isFinished = statusShort === 3 || statusLong === 'Finished';
    const isLive = statusLong?.toLowerCase().includes('in play');

    return {
      id: g.id,
      date: localDate, 
      timeLocal: localTime,
      status: isLive ? 'LIVE' : isFinished ? 'Final' : 'Programado',
      period: g?.periods?.current,
      clock: g?.status?.clock,
      arena: `${g?.arena?.name ?? ''}${g?.arena?.city ? ' — ' + g.arena.city : ''}`.trim(),
      visitors: {
        id: g?.teams?.visitors?.id,
        name: g?.teams?.visitors?.name,
        code: g?.teams?.visitors?.code,
        logo: g?.teams?.visitors?.logo,
        pts: g?.scores?.visitors?.points ?? null
      },
      home: {
        id: g?.teams?.home?.id,
        name: g?.teams?.home?.name,
        code: g?.teams?.home?.code,
        logo: g?.teams?.home?.logo,
        pts: g?.scores?.home?.points ?? null
      }
    };
  }

}