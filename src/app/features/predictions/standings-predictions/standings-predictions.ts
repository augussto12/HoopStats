import { Component, OnInit } from '@angular/core';
import { LocalApiService } from '../../../services/local-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-predictions.html',
  styleUrls: ['./standings-predictions.css', '../../standings/standings.css'],
})
export class StandingsPredictions implements OnInit {

  public ranking: any[] = [];

  constructor(private localApi: LocalApiService) { }

  async ngOnInit() {
    this.loadRanking();
  }

  async loadRanking() {
    const users = await this.localApi.getAll('users');
    this.ranking = users
      .map(u => ({
        ...u,
        totalPredictionPoints: u.totalPredictionPoints || 0
      }))
      .sort((a, b) => b.totalPredictionPoints - a.totalPredictionPoints);
  }
}
