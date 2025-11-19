import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { NbaApiService } from '../../../services/nba-api';
import { Player, PlayerStats } from '../../../models/interfaces';

@Component({
  selector: 'app-player-data',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './player-data.html',
  styleUrls: ['./player-data.css']
})
export class PlayerData implements OnInit {
  public player: Player | null = null;
  public playerData: PlayerStats[] = [];
  public loading = false;
  public error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: NbaApiService
  ) { }

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Jugador no encontrado.';
      return;
    }

    this.loading = true;
    try {
      const data = await this.api.getPlayer(id);
      const dataPlayer = await this.api.getPlayerStats(id);

      if (data && data.length > 0) {
        this.player = data[0];
        this.playerData = dataPlayer || [];
      } else {
        this.error = 'No se encontró información del jugador.';
      }
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los datos del jugador.';
    } finally {
      this.loading = false;
    }
  }
}
