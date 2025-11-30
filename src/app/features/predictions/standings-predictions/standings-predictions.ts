import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-standings-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-predictions.html',
  styleUrls: ['./standings-predictions.css', '../../standings/standings.css'],
})
export class StandingsPredictions implements OnInit {

  public ranking: any[] = [];
  public error: string | null = null;
  public isReady = false;

  constructor(private api: ApiService,) { }

  async ngOnInit() {
    await this.loadRanking();
    this.isReady = true;
  }

  async loadRanking() {
    try {
      const result = await this.api.get<any[]>('/predictions/ranking');

      this.ranking = result.sort(
        (a, b) => (b.total_prediction_points || 0) - (a.total_prediction_points || 0)
      );

    } catch (err) {
      console.error(err);
      this.error = "No se pudo cargar el ranking de predicciones.";
    }
  }
}
