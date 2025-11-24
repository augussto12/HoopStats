import { Component, Injector, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbaApiService } from '../../services/nba-api';
import { WithLoader } from '../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css']
})
export class Standings implements OnInit {

  public westTeams: any[] = [];
  public eastTeams: any[] = [];
  public error = '';

  private api = inject(NbaApiService);

  constructor(public injector: Injector) { }

  async ngOnInit() {
    try {
      const allTeams = await this.api.getStandings();

      this.westTeams = allTeams
        .filter((t: any) => t.conference.name === 'west')
        .sort((a: any, b: any) => a.conference.rank - b.conference.rank);

      this.eastTeams = allTeams
        .filter((t: any) => t.conference.name === 'east')
        .sort((a: any, b: any) => a.conference.rank - b.conference.rank);

    } catch (err) {
      this.error = 'No se pudieron cargar las posiciones.';
    }
  }
}
