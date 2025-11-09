import { Component, OnInit } from '@angular/core';
import { NbaApiService } from '../services/nba-api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NBA_COUNTRIES } from '../utils/countries';
import { FavoritesService } from '../services/favorites-service';
import { AuthService } from '../services/auth.service';

@Component({
  imports: [CommonModule, FormsModule, RouterModule],
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
  favoritesPlayersIds: number[] = [];

  nbaTeams: any[] = [];
  countries = NBA_COUNTRIES;

  constructor(private api: NbaApiService, private favService: FavoritesService, public auth: AuthService) { }

  async ngOnInit() {
    const allTeams = await this.api.getTeams();

    this.nbaTeams = allTeams.filter(
      (team: any) => team.nbaFranchise === true && team.leagues?.standard && !team.allStar
    );
    await this.getPlayersFiltered();

    const favorites = await this.favService.getFavorites();
    this.favoritesPlayersIds = favorites.teams.map((t: any) => t.id);
  }

  async getPlayersFiltered() {
    this.loading = true;
    this.error = null;

    try {
      const response = await this.api.getPlayersFiltered({
        search: this.selectedLastName || undefined,
        teamId: this.selectedTeamId || undefined,
        country: this.selectedCountry || undefined,
      });

      // Filtramos para traer solo jugadores de la nba activos
      this.players = response.filter(
        (p: any) => p?.leagues?.standard?.active === true);
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los jugadores.';
    } finally {
      this.loading = false;
    }
  }

  isFavorite(player: any): boolean {
    return this.favoritesPlayersIds.includes(player.id);
  }

  async addToFavorites(player: any) {
    if (this.isFavorite(player)) return;

    const fullName = `${player.firstname} ${player.lastname}`;

    const playerData = {
      id: player.id,
      nombre: fullName,
    };

    await this.favService.addFavorite('player', playerData);
    this.favoritesPlayersIds.push(player.id);
  }
}
