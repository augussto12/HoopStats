import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../services/nba-api';
import { mapGame } from '../utils/mapGame';

type APIGame = any;

@Component({
  selector: 'app-Games',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './Games.html',
  styleUrls: ['./games.css']
})
export class Games implements OnInit {
  loading = false;
  error: string | null = null;

  selectedStatus = '';
  selectedDate = this.toYYYYMMDD(new Date()); // fecha actual

  games: APIGame[] = [];
  gamesShown: any[] = [];

  constructor(private api: NbaApiService) { }

  ngOnInit(): void {
    this.loadGames();
  }

  private pad(n: number) {
    return String(n).padStart(2, '0');
  }

  private toLocalYYYYMMDD(d: Date) {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private addDays(dateISO: string, delta: number) {
    const d = new Date(dateISO + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return this.toLocalYYYYMMDD(d);
  }

  refresh(): void {
    this.loadGames();
  }

  async loadGames() {
    this.loading = true;
    this.error = null;

    try {
      const day = this.selectedDate;
      const prev = this.addDays(day, -1);
      const next = this.addDays(day, +1);

      const [gPrev, gDay, gNext] = await Promise.all([
        this.api.getGamesByDate(prev),
        this.api.getGamesByDate(day),
        this.api.getGamesByDate(next)
      ]);

      const all = [...gPrev, ...gDay, ...gNext];
      const unique = Array.from(new Map(all.map(g => [g.id, g])).values());

      // Filtramos por día local
      this.games = unique.filter(g => {
        const local = new Date(g?.date?.start ?? '');
        if (isNaN(+local)) return false;
        return this.toLocalYYYYMMDD(local) === day;
      });

      // Mapeamos y aplicamos filtro
      const mapped = this.games.map(mapGame);
      this.gamesShown = this.filterByStatus(mapped);

    } catch (e: any) {
      this.error = 'No se pudieron cargar los partidos.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  goToday() {
    this.selectedDate = this.toYYYYMMDD(new Date());
    this.loadGames();
  }

  onDateChange(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.selectedDate = value;
    this.loadGames();
  }

  applyFilter() {
    this.gamesShown = this.filterByStatus(this.games.map(mapGame));
  }

  // Lógica del filtro por estado
  private filterByStatus(games: any[]) {
    if (!this.selectedStatus) return games; // sin filtro

    switch (this.selectedStatus) {
      case 'Finished':
        return games.filter(g => g.status === 'Final');
      case 'Live':
        return games.filter(g => g.status === 'LIVE');
      case 'Scheduled':
        return games.filter(g => g.status === 'Programado');
      default:
        return games;
    }
  }

  private toYYYYMMDD(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
