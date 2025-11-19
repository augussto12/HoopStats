import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../../../services/nba-api';
import { mapGame } from '../../../utils/mapGame';


@Component({
  selector: 'app-head-to-head',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './head-to-head.html',
  styleUrls: ['./head-to-head.css', '../games/games.css', '../../player/players/players.css']
})
export class HeadToHead implements OnInit {
  public loading = false;
  public error: string | null = null;

  public selectedFirstTeam: number | null = null;
  public selectedSecondTeam: number | null = null;
  public hasSearched = false;

  public teams: any[] = [];
  public nbaTeams: any[] = [];
  public games: any[] = [];

  constructor(private api: NbaApiService) { }

  async ngOnInit() {
    await this.loadTeams();
  }

  public async loadTeams() {
    try {
      this.teams = await this.api.getTeams();
      this.nbaTeams = this.teams.filter(
        (team: any) => team.nbaFranchise === true && team.leagues?.standard && !team.allStar
      );
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los equipos.';
    }
  }

  public async fetchHeadToHead() {
    this.hasSearched = true;

    if (!this.selectedFirstTeam || !this.selectedSecondTeam) {
      this.error = 'Seleccione ambos equipos.';
      return;
    } else if (this.selectedFirstTeam === this.selectedSecondTeam) {
      this.error = 'Seleccione dos equipos diferentes.';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await this.api.getHeadToHead(
        this.selectedFirstTeam,
        this.selectedSecondTeam
      );

      const mapped = response.map((g: any) => mapGame(g));
      this.games = mapped;
    } catch (e) {
      console.error(e);
      this.error = 'Error al obtener los enfrentamientos.';
    } finally {
      this.loading = false;
    }
  }

}