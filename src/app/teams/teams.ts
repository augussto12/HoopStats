import { Component, OnInit } from '@angular/core';
import { NbaApiService } from '../services/nba-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class TeamsComponent implements OnInit {
  teamsWest: any[] = [];
  teamsEast: any[] = [];
  searchTerm = '';

  constructor(private nbaService: NbaApiService) { }

  async ngOnInit() {
    const allTeams = await this.nbaService.getTeams();

    const nbaTeams = allTeams.filter(
      (team: any) => team.nbaFranchise === true && team.leagues?.standard && !team.allStar
    );

    this.teamsEast = nbaTeams.filter(
      (team: any) => team.leagues.standard.conference === 'East'
    );
    this.teamsWest = nbaTeams.filter(
      (team: any) => team.leagues.standard.conference === 'West'
    );

    console.log('Equipos Este:', this.teamsEast);
    console.log('Equipos Oeste:', this.teamsWest);
  }

  // 🔍 Filtro de búsqueda (usa nombre o apodo)
  filteredTeams(teams: any[]): any[] {
    if (!this.searchTerm.trim()) return teams;
    const term = this.searchTerm.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.nickname.toLowerCase().includes(term)
    );
  }
}
