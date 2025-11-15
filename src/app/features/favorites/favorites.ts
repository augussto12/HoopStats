import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favorites-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class Favorites implements OnInit {
  public favoriteTeams: any[] = [];
  public favoritePlayers: any[] = [];

  constructor(private favoritesService: FavoritesService) { }

  async ngOnInit() {
    const favorites = await this.favoritesService.getFavorites();
    this.favoriteTeams = favorites.teams;
    this.favoritePlayers = favorites.players;
  }

  async remove(type: 'team' | 'player', id: number) {
    await this.favoritesService.removeFavorite(type, id);
    if (type === 'team') {
      this.favoriteTeams = this.favoriteTeams.filter(t => t.id !== id);
    } else {
      this.favoritePlayers = this.favoritePlayers.filter(p => p.id !== id);
    }
  }
}
