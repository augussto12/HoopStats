import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../services/nba-api';

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

  selectedStatus = ''; // 👈 filtro actual
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
        this.api.getGamesByDate(next),
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
      const mapped = this.games.map(g => this.mapGame(g));
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

  // 👇 Nuevo método para aplicar el filtro sin recargar desde la API
  applyFilter() {
    this.gamesShown = this.filterByStatus(this.games.map(g => this.mapGame(g)));
  }

  // 👇 Lógica del filtro por estado
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

  private mapGame(g: any) {
    const startUtc = g?.date?.start ? new Date(g.date.start) : null;
    const statusShort = g?.status?.short;
    const statusLong = g?.status?.long ?? '';
    const isFinished = statusShort === 3 || statusLong === 'Finished';
    const isLive = statusLong?.toLowerCase().includes('in play');

    const toLocalTime = (d: Date | null) =>
      d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    return {
      id: g.id,
      arena: `${g?.arena?.name ?? ''} ${g?.arena?.city ? '— ' + g.arena.city : ''}`.trim(),
      timeLocal: toLocalTime(startUtc),
      status: isLive ? 'LIVE' : isFinished ? 'Final' : 'Programado',
      period: g?.periods?.current,
      clock: g?.status?.clock,
      visitors: {
        id: g?.teams?.visitors?.id,
        name: g?.teams?.visitors?.name,
        code: g?.teams?.visitors?.code,
        logo: g?.teams?.visitors?.logo,
        pts: g?.scores?.visitors?.points ?? null
      },
      home: {
        id: g?.teams?.home?.id,
        name: g?.teams?.home?.name,
        code: g?.teams?.home?.code,
        logo: g?.teams?.home?.logo,
        pts: g?.scores?.home?.points ?? null
      }
    };
  }
}