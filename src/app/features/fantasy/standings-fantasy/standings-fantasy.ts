import { Component } from '@angular/core';
import { LocalApiService } from '../../../services/local-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings-fantasy',
  imports: [CommonModule],
  templateUrl: './standings-fantasy.html',
  styleUrl: './standings-fantasy.css',
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
        fantasyName: u.fantasy.name,
        fantasyPoints: u.fantasy.totalPoints || 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

}
