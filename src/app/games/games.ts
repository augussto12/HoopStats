// src/app/Games/Games.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbaApiService } from '../services/nba-api';

type APIGame = any;

@Component({
  selector: 'app-Games',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './Games.html',
  styleUrls: ['./games.css']
})
export class Games implements OnInit {
  loading = false;
  error: string | null = null;

  // fecha seleccionada (YYYY-MM-DD)
  selectedDate = this.toYYYYMMDD(new Date());

  games: APIGame[] = [];
  gamesShown: any[] = [];

  constructor(private api: NbaApiService) { }

  ngOnInit(): void {
    this.loadGames();
  }

  private pad(n: number) { return String(n).padStart(2, '0'); }

  // YYYY-MM-DD en HORA LOCAL
  private toLocalYYYYMMDD(d: Date) {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private addDays(dateISO: string, delta: number) {
    const d = new Date(dateISO + 'T00:00:00'); // forzamos hora local
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
      // día seleccionado en local
      const day = this.selectedDate;
      const prev = this.addDays(day, -1);
      const next = this.addDays(day, +1);

      // Traemos tres días en paralelo
      const [gPrev, gDay, gNext] = await Promise.all([
        this.api.getGamesByDate(prev),
        this.api.getGamesByDate(day),
        this.api.getGamesByDate(next),
      ]);

      // Unimos y de-duplicamos por id
      const all = [...gPrev, ...gDay, ...gNext];
      const unique = Array.from(new Map(all.map(g => [g.id, g])).values());

      // Filtramos por dia local del usuario
      this.games = unique.filter(g => {
        const local = new Date(g?.date?.start ?? '');
        if (isNaN(+local)) return false;
        return this.toLocalYYYYMMDD(local) === day;
      });

      this.gamesShown = this.games.map(g => this.mapGame(g));
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


  private toYYYYMMDD(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private mapGame(g: any) {
    // API-Sports estructura
    const startUtc = g?.date?.start ? new Date(g.date.start) : null;
    const statusShort = g?.status?.short; // 1 Scheduled, 2 Not started, 3 Finished
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
