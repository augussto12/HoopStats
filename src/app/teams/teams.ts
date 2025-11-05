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
  selectedDivision = '';


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

  }

  // Filtro de búsqueda y división
  filteredTeams(teams: any[]): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    return teams.filter((t) => {
      const matchesName =
        !term ||
        t.name.toLowerCase().includes(term) ||
        t.nickname.toLowerCase().includes(term);

      const matchesDivision =
        !this.selectedDivision ||
        t.leagues?.standard?.division === this.selectedDivision;

      return matchesName && matchesDivision;
    });
  }
}
