import { Component, OnInit } from '@angular/core';
import { PrediccionService } from '../../../services/predictions/predictions-service';
import { AuthService } from '../../../services/auth.service';
import { Prediction } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-predictions',
  imports: [CommonModule],
  templateUrl: './my-predictions.html',
  styleUrls: ['./my-predictions.css'],
})
export class MyPredictions implements OnInit {

  public predictions: Prediction[] = [];
  public loading = true;
  public error = '';

  constructor(
    private predictionsService: PrediccionService,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    try {
      const userData = localStorage.getItem('user');

      if (!userData) {
        this.error = 'No estás logueado';
        this.loading = false;
        return;
      }

      const user = JSON.parse(userData);

      this.predictions = await this.predictionsService.getByUser(user.id);
    } catch (err) {
      this.error = 'Error al cargar tus predicciones';
    } finally {
      this.loading = false;
    }
  }
}