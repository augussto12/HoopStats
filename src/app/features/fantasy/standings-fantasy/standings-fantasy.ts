import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-standings-fantasy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-fantasy.html',
  styleUrls: ['./standings-fantasy.css', '../../standings/standings.css'],
})
export class StandingsFantasy {

  public ranking: any[] = [];

  constructor(private api: ApiService) { }

  async ngOnInit() {
    this.loadRanking();
  }

  async loadRanking() {
    try {
      this.ranking = await this.api.get<any[]>('/fantasy/ranking');

    } catch (err) {
      console.error('Error al obtener ranking:', err);
    }
  }
}
