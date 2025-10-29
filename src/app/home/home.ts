import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbaApiService } from '../services/nba-api';
import { RouterModule } from '@angular/router';
import { mapGame } from '../utils/mapGame';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../Games/games.css']
})
export class Home implements OnInit {
  liveGames: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private nbaService: NbaApiService) { }

  async ngOnInit() {
    this.loading = true;
    try {
      const response = await this.nbaService.getLiveGames();
      this.liveGames = response.map(mapGame);
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los partidos en vivo.';
    } finally {
      this.loading = false;
    }
  }
}