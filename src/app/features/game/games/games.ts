import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../../../services/nba-api';
import { mapGame } from '../../../utils/mapGame';
import { AuthService } from '../../../services/auth.service';
import { PrediccionService } from '../../../services/predictions/predictions-service';

@Component({
  selector: 'app-Games',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './Games.html',
  styleUrls: ['./games.css']
})
export class Games implements OnInit {
  public loading = false;
  public error: string | null = null;

  public selectedStatus = '';
  public selectedDate = this.toYYYYMMDD(new Date());
  public gamesShown: any[] = [];

  private games: any[] = [];
  private router = inject(Router);

  constructor(private api: NbaApiService, private predictionService: PrediccionService, public auth: AuthService) { }

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

  public async loadGames() {
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

  public goToday() {
    this.selectedDate = this.toYYYYMMDD(new Date());
    this.loadGames();
  }

  public onDateChange(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.selectedDate = value;
    this.loadGames();
  }

  public applyFilter() {
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


  public async savePrediction(g: any) {
    const user = JSON.parse(localStorage.getItem('user')!);

    const payload = {
      idUser: user.id,
      idGame: g.id,
      homeTeam: g.home.name,
      visitorTeam: g.visitors.name,
      puntosLocalPrediccion: g.predHome,
      puntosVisitantePrediccion: g.predVisitors,
      puntosObtenidos: 0,
      procesada: false
    };


    const existing = await this.predictionService.getForGame(user.id, g.id);

    if (existing.length > 0) {
      const id = existing[0].id;
      await this.predictionService.update(id, payload);
    } else {
      await this.predictionService.create(payload);
    }
    g.savedPrediction = true;
  }

  public getLink(g: any) {
    if (g.status === 'Programado') {
      return;
    } else {
      this.router.navigate(['/game-details', g.id]);
    }
  }

}