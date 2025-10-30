import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NbaApiService } from '../services/nba-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { mapGame } from '../utils/mapGame';

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
      const mapped = regularSeasonGames.map((g: any) => mapGame(g));

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


}