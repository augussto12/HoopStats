import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NbaApiService } from '../../../services/nba-api';
import { AuthService } from '../../../services/auth.service';
import { PredictionService } from '../../../services/predictions-service';
import { getGamesByDateMapped, filterByStatus } from '../../../utils/gameUtils';
import { DbPrediction } from '../../../models/interfaces';

@Component({
  selector: 'app-Games',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './games.html',
  styleUrls: ['./games.css']
})
export class Games implements OnInit {

  public loading = false;
  public error: string | null = null;

  public selectedStatus = '';
  public selectedDate = this.toYYYYMMDD(new Date());
  public gamesShown: any[] = [];
  private myPredictionsCache: DbPrediction[] | null = null;

  private games: any[] = [];
  private router = inject(Router);

  constructor(
    private api: NbaApiService,
    private predictionService: PredictionService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadGames();
  }

  async loadGames() {
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



  private async injectUserPredictions() {
    if (!this.auth.isLoggedIn()) return;

    if (!this.myPredictionsCache) {
      this.myPredictionsCache = await this.predictionService.getMyPredictions();
    }

    const preds = this.myPredictionsCache;

    for (let g of this.gamesShown) {
      const pred = preds.find(p => p.game_id === g.id);

      if (pred) {
        g.predHome = pred.puntos_local_prediccion;
        g.predVisitors = pred.puntos_visitante_prediccion;
        g.savedPrediction = true;
        g.predictionId = pred.id;
      }
    }
  }


  refresh() {
    this.loadGames();
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

    g.predictionError = null;

    if (g.predHome == null || g.predHome === '') {
      g.predictionError = 'Debe ingresar la predicción del local.';
      return;
    }

    if (g.predVisitors == null || g.predVisitors === '') {
      g.predictionError = 'Debe ingresar la predicción del visitante.';
      return;
    }

    const existing = await this.predictionService.getPredictionForGame(g.id);

    if (existing) {
      await this.predictionService.deletePrediction(existing.id);
    }

    await this.predictionService.createPrediction({
      game_id: g.id,
      home_team: g.home.name,
      visitor_team: g.visitors.name,
      puntos_local_prediccion: g.predHome,
      puntos_visitante_prediccion: g.predVisitors
    });

    g.savedPrediction = true;
  }

  public getLink(g: any) {
    if (g.status !== 'Programado') {
      this.router.navigate(['/game-details', g.id]);
    }
  }
}
