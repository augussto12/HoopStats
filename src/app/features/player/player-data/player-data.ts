import { Component, Injector, OnInit, inject } from '@angular/core';
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
  public error: string | null = null;

  private route = inject(ActivatedRoute);
  private api = inject(NbaApiService);

  constructor() { } 

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Jugador no encontrado.';
      return;
    }

    try {
      const playerInfo = await this.api.getPlayer(id);
      const playerStats = await this.api.getPlayerStats(id);

      if (!playerInfo || playerInfo.length === 0) {
        this.error = 'No se encontró información del jugador.';
        return;
      }

      this.player = playerInfo[0];
      this.playerData = playerStats || [];

    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los datos del jugador.';
    }
  }
}
