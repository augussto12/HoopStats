import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites implements OnInit {
  favoriteTeams: any[] = [];

  ngOnInit(): void {
    const raw = localStorage.getItem('favoriteTeams');
    this.favoriteTeams = raw ? JSON.parse(raw) : [];
  }

  private getTeamId(team: any): string {
    return String(team?.id ?? team?.teamId ?? team?.code ?? team?.name ?? team?.fullName);
  }

  remove(team: any): void {
    const id = this.getTeamId(team);
    this.favoriteTeams = this.favoriteTeams.filter(t => this.getTeamId(t) !== id);
    localStorage.setItem('favoriteTeams', JSON.stringify(this.favoriteTeams));
  }
}
