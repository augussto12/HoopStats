import { Injectable } from '@angular/core';
import { LocalApiService } from './local-api';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
    private entity = 'users';

    constructor(private api: LocalApiService) { }

    private getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }

    private saveUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    async getFavorites() {
        const user = this.getUser();
        if (!user?.id) return { teams: [], players: [] };

        const fullUser = await this.api.getById(this.entity, user.id);
        return fullUser?.favorites || { teams: [], players: [] };
    }

    async addFavorite(type: 'team' | 'player', item: any) {
        const user = this.getUser();
        if (!user?.id) return;

        const fullUser = await this.api.getById(this.entity, user.id);
        fullUser.favorites ??= { teams: [], players: [] };

        const list = type === 'team' ? fullUser.favorites.teams : fullUser.favorites.players;

        const exists = list.some((i: any) => i.id === item.id);
        if (!exists) list.push(item);

        await this.api.update(this.entity, user.id, fullUser);
        this.saveUser(fullUser);
        return fullUser.favorites;
    }

    async removeFavorite(type: 'team' | 'player', id: number) {
        const user = this.getUser();
        if (!user?.id) return;

        const fullUser = await this.api.getById(this.entity, user.id);
        if (!fullUser?.favorites) return;

        const key = type === 'team' ? 'teams' : 'players';
        fullUser.favorites[key] = fullUser.favorites[key].filter((x: any) => x.id !== id);

        await this.api.update(this.entity, user.id, fullUser);
        this.saveUser(fullUser);
        return fullUser.favorites;
    }

    async isFavorite(type: 'team' | 'player', id: number): Promise<boolean> {
        const favorites = await this.getFavorites();
        const list = type === 'team' ? favorites.teams : favorites.players;
        return list.some((i: any) => i.id === id);
    }
}
