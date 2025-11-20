import { Component } from '@angular/core';
import { LocalApiService } from '../../../services/local-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings-fantasy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings-fantasy.html',
  styleUrls: ['./standings-fantasy.css', '../../standings/standings.css'],
})
export class StandingsFantasy {

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
        fantasyName: u?.fantasy?.name,
        fantasyPoints: u?.fantasy?.totalPoints || 0
      }))
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints);

  }
}
