import { Component, OnInit, Injector } from '@angular/core';
import { PredictionService } from '../../../services/predictions-service';
import { AuthService } from '../../../services/auth.service';
import { DbPrediction } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-predictions.html',
  styleUrls: ['./my-predictions.css'],
})
export class MyPredictions implements OnInit {

  public predictions: DbPrediction[] = [];
  public error = '';
  public isReady = false;

  constructor(
    private predictionsService: PredictionService,
    private auth: AuthService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    try {
      if (!this.auth.isLoggedIn()) {
        this.error = 'No estás logueado';
      } else {
        this.predictions = await this.predictionsService.getMyPredictions();
      }
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar tus predicciones';
    }

    this.isReady = true;
  }
}
