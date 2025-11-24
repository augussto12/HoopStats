import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-standings-fantasy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-fantasy.html',
  styleUrls: ['./standings-fantasy.css', '../../standings/standings.css'],
})
export class StandingsFantasy {

  public ranking: any[] = [];
  public error = '';

  constructor(
    private api: ApiService,
    public injector: Injector  // <- NECESARIO para el decorador
  ) { }

  async ngOnInit() {
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
