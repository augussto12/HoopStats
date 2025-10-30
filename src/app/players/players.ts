import { Component, OnInit } from '@angular/core';
import { NbaApiService } from '../services/nba-api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule,RouterModule],
  selector: 'app-players',
  templateUrl: './players.html',
  styleUrls: ['./players.css', '../players-by-team/players-by-team.css'],
})
export class Players implements OnInit {
  loading = false;
  error: string | null = null;
  players: any[] = [];

  // Filtros
  selectedCountry: string = '';
  selectedLastName: string = '';
  selectedTeamId: number | null = null;

  nbaTeams: any[] = [];

  constructor(private api: NbaApiService) { }

  async ngOnInit() {
    const allTeams = await this.api.getTeams();

    this.nbaTeams = allTeams.filter(
      (team: any) => team.nbaFranchise === true && team.leagues?.standard && !team.allStar
    );
  }

  async getPlayersFiltered() {
    this.loading = true;
    this.error = null;

    try {
      this.players = await this.api.getPlayersFiltered({
        search: this.selectedLastName || undefined,
        teamId: this.selectedTeamId || undefined,
        country: this.selectedCountry || undefined,
      });
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los jugadores.';
    } finally {
      this.loading = false;
    }
  }

}
