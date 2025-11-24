import { Component, OnInit, Injector, inject } from '@angular/core';
import { NbaApiService } from '../../../services/nba-api';
import { FavoritesService } from '../../../services/favorites-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class TeamsComponent implements OnInit {

  public teamsWest: any[] = [];
  public teamsEast: any[] = [];
  public searchTerm = '';
  public selectedDivision = '';
  public favoriteTeamIds: number[] = [];
  public error = '';

  public divisions = ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'];

  private nbaService = inject(NbaApiService);
  private favoritesService = inject(FavoritesService);
  public auth = inject(AuthService);

  constructor(public injector: Injector) { }

  async ngOnInit() {
    await this.getTeams();
  }

  async getTeams() {
    try {
      const allTeams = await this.nbaService.getTeams();

      const nbaTeams = allTeams.filter(
        (team: any) => team.nbaFranchise && team.leagues?.standard && !team.allStar
      );

      this.teamsEast = nbaTeams.filter((t: any) => t.leagues.standard.conference === 'East');
      this.teamsWest = nbaTeams.filter((t: any) => t.leagues.standard.conference === 'West');

      // 🟢 Solo pedir favoritos si está logueado
      if (this.auth.isLoggedIn()) {
        try {
          const favorites = await this.favoritesService.getFavorites();
          this.favoriteTeamIds = favorites.teams.map((t: any) => t.id);
        } catch (favErr) {
          console.warn("⚠ No se pudieron cargar los favoritos (user no logueado o error)");
        }
      }

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los equipos.';
    }
  }

  isFavorite(team: any): boolean {
    return this.favoriteTeamIds.includes(team.id);
  }

  async addToFavorites(team: any) {
    if (this.isFavorite(team)) return;

    await this.favoritesService.addFavorite('team', team.id);
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
