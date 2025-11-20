import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NbaApiService } from '../../../services/nba-api';
import { AuthService } from '../../../services/auth.service';
import { PrediccionService } from '../../../services/predictions/predictions-service';
import { getGamesByDateMapped,filterByStatus } from '../../../utils/gameUtils';

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

  constructor(
    private api: NbaApiService,
    private predictionService: PrediccionService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadGames();
  }

  public async loadGames() {
    this.loading = true;
    this.error = null;

    try {
      const mappedGames = await getGamesByDateMapped(this.api, this.selectedDate);

      this.games = mappedGames;
      this.gamesShown = filterByStatus(mappedGames, this.selectedStatus);

      await this.injectUserPredictions();

    } catch (err) {
      this.error = 'No se pudieron cargar los partidos.';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  refresh() {
    this.loadGames();
  }

  private async injectUserPredictions() {
    if (!this.auth.isLoggedIn()) return;

    const user = JSON.parse(localStorage.getItem('user')!);
    const predictions = await this.predictionService.getByUser(user.id);

    for (let g of this.gamesShown) {
      const pred = predictions.find((p: any) => p.idGame === g.id);
      if (pred) {
        g.predHome = pred.puntosLocalPrediccion;
        g.predVisitors = pred.puntosVisitantePrediccion;
        g.savedPrediction = true;
        g.predictionId = pred.id;
        g.savedPrediction = false;
      }
    }
  }


  public goToday() {
    this.selectedDate = this.toYYYYMMDD(new Date());
    this.loadGames();
  }

  public onDateChange(ev: Event) {
    this.selectedDate = (ev.target as HTMLInputElement).value;
    this.loadGames();
  }

  public async applyFilter() {
    this.gamesShown = filterByStatus(this.games, this.selectedStatus);
    await this.injectUserPredictions();
  }

  private toYYYYMMDD(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }


  public async savePrediction(g: any) {
    const user = JSON.parse(localStorage.getItem('user')!);

    g.predictionError = null;

    if (g.predHome == null || g.predHome === '') {
      g.predictionError = 'Debe ingresar la predicción del local.';
      return;
    }

    if (g.predVisitors == null || g.predVisitors === '') {
      g.predictionError = 'Debe ingresar la predicción del visitante.';
      return;
    }

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
      await this.predictionService.update(existing[0].id, payload);
    } else {
      await this.predictionService.create(payload);
    }

    g.savedPrediction = true;
  }
  
  public getLink(g: any) {
    if (g.status !== 'Programado') {
      this.router.navigate(['/game-details', g.id]);
    }
  }

}