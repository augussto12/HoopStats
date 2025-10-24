import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NbaApiService } from '../services/nba-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-players-by-team',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './players-by-team.html',
  styleUrls: ['./players-by-team.css']
})
export class PlayersByTeam implements OnInit {
  teamId!: number;
  team: any;
  players: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private nbaService: NbaApiService
  ) { }

  async ngOnInit() {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.teamId) return;

    const allTeams = await this.nbaService.getTeams();
    this.team = allTeams.find((t: any) => t.id === this.teamId);

    const playersResponse = await this.nbaService.getPlayersByTeam(this.teamId);
    this.players = playersResponse; 

    console.log('Equipo:', this.team);
    console.log('Jugadores:', this.players);
  }
}
