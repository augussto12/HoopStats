import { Component, OnInit } from '@angular/core';
import { PredictionService } from '../../../services/predictions-service';
import { AuthService } from '../../../services/auth.service';
import { DbPrediction } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-predictions.html',
  styleUrls: ['./my-predictions.css'],
})
export class MyPredictions implements OnInit {

  public predictions: DbPrediction[] = [];
  public loading = true;
  public error = '';

  constructor(
    private predictionsService: PredictionService,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    try {
      if (!this.auth.isLoggedIn()) {
        this.error = 'No estás logueado';
        this.loading = false;
        return;
      }

      const resp = await this.predictionsService.getMyPredictions();

      this.predictions = resp;

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar tus predicciones';
    } finally {
      this.loading = false;
    }
  }
}
