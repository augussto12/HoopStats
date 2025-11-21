import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {

    constructor(private api: ApiService) { }

    // Obtener favoritos del backend
    async getFavorites() {
        return await this.api.get<{ players: any[], teams: any[] }>(`/favorites`);
    }

    // Agregar favorito
    async addFavorite(type: 'player' | 'team', id: number) {
        return await this.api.post(`/favorites`, { type, id });
    }

    // Eliminar favorito
    async removeFavorite(type: 'player' | 'team', id: number) {
        return await this.api.delete(`/favorites/${type}/${id}`);
    }

    // Verificar si es favorito
    async isFavorite(type: 'player' | 'team', id: number) {
        const fav = await this.getFavorites();
        const list = type === 'player' ? fav.players : fav.teams;
        return list.some((i: any) => i.id === id);
    }
}
