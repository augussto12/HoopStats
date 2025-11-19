import { Injectable } from '@angular/core';
import { LocalApiService } from '../local-api';
import { FantasyTeam, FantasyPlayer } from '../../models/interfaces';
import { NbaApiService } from '../nba-api';
import { FantasyPointsService } from './fantasy-points';

@Injectable({ providedIn: 'root' })
export class FantasyService {

    private entity = 'users';

    constructor(
        private api: LocalApiService,
        private fantasyPoints: FantasyPointsService
    ) { }

    private getLocalUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }

    private saveLocalUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    async getFantasyTeam(): Promise<FantasyTeam | null> {
        const usr = this.getLocalUser();
        if (!usr.id) return null;

        const fullUser = await this.api.getById(this.entity, usr.id);
        return fullUser.fantasy ?? null;
    }

    async createFantasyTeam(name: string) {
        const usr = this.getLocalUser();
        if (!usr.id) return;

        const fullUser = await this.api.getById(this.entity, usr.id);
        fullUser.fantasy.name = name;

        await this.api.patch(this.entity, usr.id, { fantasy: fullUser.fantasy });

        usr.fantasy = fullUser.fantasy;
        this.saveLocalUser(usr);

        return fullUser.fantasy;
    }

    async addPlayer(player: FantasyPlayer) {
        const usr = this.getLocalUser();
        if (!usr.id) return;

        const fullUser = await this.api.getById(this.entity, usr.id);

        if (fullUser.fantasy.players.length >= 5)
            throw new Error("Tu equipo ya tiene 5 jugadores");

        if (fullUser.fantasy.players.some((p: any) => p.id === player.id))
            throw new Error("Este jugador ya está en tu equipo");

        if (fullUser.fantasy.budget < player.price)
            throw new Error("No tienes suficiente presupuesto");

        fullUser.fantasy.players.push({
            ...player,
            totalPts: 0
        });
        fullUser.fantasy.budget -= player.price;

        await this.api.patch(this.entity, usr.id, { fantasy: fullUser.fantasy });

        usr.fantasy = fullUser.fantasy;
        this.saveLocalUser(usr);

        return fullUser.fantasy;
    }

    async removePlayer(idPlayer: number) {
        const usr = this.getLocalUser();
        if (!usr.id) return;

        const user = await this.api.getById(this.entity, usr.id);
        const fantasy = user.fantasy;

        const player = fantasy.players.find((p: any) => p.id === idPlayer);
        if (!player) return fantasy;

        // devolvemos creditos
        fantasy.budget += player.price;

        fantasy.players = fantasy.players.filter((p: any) => p.id !== idPlayer);

        await this.api.patch(this.entity, usr.id, { fantasy });

        usr.fantasy = fantasy;
        this.saveLocalUser(usr);

        return fantasy;
    }


    updateGlobalFantasyPoints() {
        return this.fantasyPoints.updateGlobalFantasyPoints();
    }

}
