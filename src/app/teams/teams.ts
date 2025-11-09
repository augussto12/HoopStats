import { Component, OnInit } from '@angular/core';
import { NbaApiService } from '../services/nba-api';
import { FavoritesService } from '../services/favorites-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  favoriteTeamIds: number[] = [];

  divisions = [
    'Atlantic', 'Central', 'Southeast',
    'Northwest', 'Pacific', 'Southwest'
  ];

  constructor(
    private nbaService: NbaApiService,
    private favoritesService: FavoritesService,
    public auth: AuthService
  ) { }

  async ngOnInit() {
    const allTeams = await this.nbaService.getTeams();

    const nbaTeams = allTeams.filter(
      (team: any) => team.nbaFranchise && team.leagues?.standard && !team.allStar
    );

    this.teamsEast = nbaTeams.filter((t: any) => t.leagues.standard.conference === 'East');
    this.teamsWest = nbaTeams.filter((t: any) => t.leagues.standard.conference === 'West');

    const favorites = await this.favoritesService.getFavorites();
    this.favoriteTeamIds = favorites.teams.map((t: any) => t.id);
  }

  isFavorite(team: any): boolean {
    return this.favoriteTeamIds.includes(team.id);
  }

  async addToFavorites(team: any) {
    if (this.isFavorite(team)) return;

    const teamData = {
      id: team.id,
      nombre: team.fullName || team.name,
      logo: team.logo,
    };

    await this.favoritesService.addFavorite('team', teamData);
    this.favoriteTeamIds.push(team.id);
  }

  filteredTeams(teams: any[]): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return teams.filter(t => {
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
