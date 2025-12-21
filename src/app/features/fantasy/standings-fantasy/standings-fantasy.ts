import { Component, OnInit } from '@angular/core'; // Agregamos OnInit
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service'; // <--- Importar

@Component({
  selector: 'app-standings-fantasy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-fantasy.html',
  styleUrls: ['./standings-fantasy.css', '../../standings/standings.css'],
})
export class StandingsFantasy implements OnInit {

  public ranking: any[] = [];
  public error = '';
  public currentUsername: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService 
  ) { }

  async ngOnInit() {
    // Obtenemos el usuario del servicio
    const user = this.auth.getUser();
    if (user) {
      this.currentUsername = user.username;
    }

    await this.loadRanking();
  }

  async loadRanking() {
    try {
      this.ranking = await this.api.get<any[]>('/fantasy/ranking');
    } catch (err) {
      this.error = 'Error al obtener el ranking';
      console.error('Error al obtener ranking:', err);
    }
  }
}