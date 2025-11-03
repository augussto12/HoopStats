import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../services/nba-api';
import { mapGame } from '../utils/mapGame'; 

type APIGame = any;

@Component({
  selector: 'app-head-to-head',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './head-to-head.html',
  styleUrls: ['./head-to-head.css', '../Games/games.css','../players/players.css']
})
export class HeadToHead implements OnInit {
  loading = false;
  error: string | null = null;

  selectedFirstTeam: number | null = null;
  selectedSecondTeam: number | null = null;

  teams: any[] = [];
  games: APIGame[] = [];

  constructor(private api: NbaApiService) { }

  async ngOnInit() {
    await this.loadTeams();
  }

  async loadTeams() {
    try {
      this.teams = await this.api.getTeams();
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los equipos.';
    }
  }

  async fetchHeadToHead() {
    if (!this.selectedFirstTeam || !this.selectedSecondTeam) {
      this.error = 'Seleccioná ambos equipos.';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await this.api.getHeadToHead(
        this.selectedFirstTeam,
        this.selectedSecondTeam
      );

      const mapped = response.map((g: any) => mapGame(g));

      this.games = mapped;
    } catch (e) {
      console.error(e);
      this.error = 'Error al obtener los enfrentamientos.';
    } finally {
      this.loading = false;
    }
  }

}