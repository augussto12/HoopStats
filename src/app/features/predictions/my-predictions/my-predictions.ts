import { Component, OnInit, Injector } from '@angular/core';
import { PredictionService } from '../../../services/predictions-service';
import { AuthService } from '../../../services/auth.service';
import { DbPrediction } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-predictions.html',
  styleUrls: ['./my-predictions.css'],
})
export class MyPredictions implements OnInit {

  public allPredictions: DbPrediction[] = [];
  public predictions: DbPrediction[] = [];

  public error = '';
  public isReady = false;

  // FILTROS
  public filterDate: string | null = null;

  // PAGINADO
  currentPage = 1;
  pageSize = 9;

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
        this.allPredictions = await this.predictionsService.getMyPredictions();

        // Ordenar por fecha descendente
        this.allPredictions.sort((a, b) =>
          new Date(b.game_date).getTime() - new Date(a.game_date).getTime()
        );

        this.predictions = [...this.allPredictions];
      }
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar tus predicciones';
    }

    this.isReady = true;
  }

  // FILTRO POR FECHA
  applyFilters() {
    let list = [...this.allPredictions];

    if (this.filterDate) {
      list = list.filter(p => p.game_date === this.filterDate);
    }

    this.predictions = list;
    this.currentPage = 1;
  }

  clearFilters() {
    this.filterDate = null;
    this.predictions = [...this.allPredictions];
    this.currentPage = 1;
  }

  // PAGINADO
  get totalPages() {
    return Math.ceil(this.predictions.length / this.pageSize);
  }

  get paginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.predictions.slice(start, start + this.pageSize);
  }
}
