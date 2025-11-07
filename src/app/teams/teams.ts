import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NbaApiService } from '../services/nba-api';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css'],
})
export class TeamsComponent implements OnInit {
  teamsWest: any[] = [];
  teamsEast: any[] = [];
  searchTerm = '';
  selectedDivision = '';

  // memoria local
  private favoriteIds = new Set<string>();

  divisions = [
    'Atlantic', 'Central', 'Southeast',
    'Northwest', 'Pacific', 'Southwest'
  ];

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

    this.loadFavorites();
  }

  // ===== Favoritos (solo agregar desde acá) =====
  private getTeamId(team: any): string {
    return String(team?.id ?? team?.teamId ?? team?.code ?? team?.name ?? team?.fullName);
  }

  private loadFavorites(): void {
    try {
      const raw = localStorage.getItem('favoriteTeams');
      const arr = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(arr)
        ? (typeof arr[0] === 'object' ? arr.map((t: any) => this.getTeamId(t)) : arr)
        : [];
      this.favoriteIds = new Set(ids.map((x: any) => String(x)));
    } catch {
      this.favoriteIds = new Set();
    }
  }

  private saveFavorites(teams: any[]): void {
    localStorage.setItem('favoriteTeams', JSON.stringify(teams));
  }

  isFavorite(team: any): boolean {
    return this.favoriteIds.has(this.getTeamId(team));
  }

  addToFavorites(team: any): void {
    const id = this.getTeamId(team);
    if (this.favoriteIds.has(id)) return;

    const raw = localStorage.getItem('favoriteTeams');
    const current = raw ? JSON.parse(raw) : [];
    const list: any[] =
      Array.isArray(current) && typeof current[0] === 'object' ? current : [];

    // evitar duplicados
    if (!list.some(t => this.getTeamId(t) === id)) {
      // guardamos el objeto completo (más fácil para Favorites)
      list.push(team);
      this.saveFavorites(list);
      this.favoriteIds.add(id);
    }
  }

  // ===== Filtros =====
  filteredTeams(teams: any[]): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    return teams.filter((t) => {
      const matchesName =
        !term ||
        t.name?.toLowerCase().includes(term) ||
        t.nickname?.toLowerCase().includes(term) ||
        t.fullName?.toLowerCase().includes(term);

      const matchesDivision =
        !this.selectedDivision ||
        t.leagues?.standard?.division === this.selectedDivision;

      return matchesName && matchesDivision;
    });
  }
}
