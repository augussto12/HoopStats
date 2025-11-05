import { Component, OnInit } from '@angular/core';
import { NbaApiService } from '../services/nba-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings',
  imports: [CommonModule],
  templateUrl: './standings.html',
  styleUrl: './standings.css'
})
export class Standings implements OnInit {

  westTeams: any[] = [];
  eastTeams: any[] = [];

  constructor(private api: NbaApiService) { }

  async ngOnInit() {
    const allTeams = await this.api.getStandings();
    this.westTeams = allTeams.filter((item: any) => item.conference.name === 'west');
    this.eastTeams = allTeams.filter((item: any) => item.conference.name === 'east');

    this.westTeams.sort((a, b) => a.conference.rank - b.conference.rank);
    this.eastTeams.sort((a, b) => a.conference.rank - b.conference.rank);

  }


}
