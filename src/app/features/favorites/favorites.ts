import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favorites-service';
import { RouterLink } from '@angular/router';
import { WithLoader } from '../../decorators/with-loader.decorator';

@WithLoader()
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
  public error: string | null = null;
  public isReady = false;

  constructor(
    private favoritesService: FavoritesService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    try {
      const favorites = await this.favoritesService.getFavorites();
      this.favoriteTeams = favorites.teams || [];
      this.favoritePlayers = favorites.players || [];
    } catch (err) {
      console.error(err);
      this.error = "No se pudieron cargar tus favoritos.";
    }

    this.isReady = true;
  }

  async remove(type: 'team' | 'player', id: number) {
    try {
      await this.favoritesService.removeFavorite(type, id);

      if (type === 'team') {
        this.favoriteTeams = this.favoriteTeams.filter(t => t.id !== id);
      } else {
        this.favoritePlayers = this.favoritePlayers.filter(p => p.id !== id);
      }

    } catch (err) {
      console.error(err);
      this.error = "Error al eliminar el favorito.";
    }
  }
}
