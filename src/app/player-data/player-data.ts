import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NbaApiService } from '../services/nba-api';
import { useGoBack } from '../utils/navigation';

@Component({
  selector: 'app-player-data',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-data.html',
  styleUrls: ['./player-data.css']
})
export class PlayerData implements OnInit {
  player: any = null;
  playerData: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: NbaApiService
  ) {}

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
        this.playerData = dataPlayer;
        console.log('Jugador cargado:', this.player);
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

  goBack = useGoBack();

}
