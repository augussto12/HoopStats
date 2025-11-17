import { Injectable } from '@angular/core';
import { LocalApiService } from './local-api';
import { FantasyTeam, FantasyPlayer } from '../models/interfaces';
import { NbaApiService } from './nba-api';

@Injectable({ providedIn: 'root' })
export class FantasyService {

    private entity = 'users';

    constructor(
        private api: LocalApiService,
        private nbaApi: NbaApiService
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

        fullUser.fantasy.players.push(player);
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


    async updateGlobalFantasyPoints() {
        const configList = await this.api.getAll("lastUpdated");
        const config = configList[0];

        const lastUpdate = new Date(config.lastUpdatedFantasy); //obtenemos la ultima vez que se actualizaron los datos

        const users = await this.api.getAll("users");

        let totalProcessed = 0;

        for (const user of users) {
            if (!user.fantasy) continue;

            let addedPoints = 0;

            for (const player of user.fantasy.players) {

                // 1) Obtener stats del ultimo partido
                const statsRes = await this.nbaApi.getPlayerStats(player.id);

                if (!statsRes || statsRes.length === 0) continue; // si no jugo todavia o no hay datos

                const stats = statsRes[0];

                // validar game.id
                if (!stats.game || !stats.game.id) continue;

                // 2) Obtener fecha del partido
                const gameInfo = await this.nbaApi.getGameData(stats.game.id);

                if (!gameInfo || !gameInfo.date) continue;

                const gameDate = new Date(gameInfo.date);

                // 3) Comparar fechas
                if (gameDate <= lastUpdate) continue;

                // 4) Calcular puntos
                addedPoints += this.calcFantasyPoints(stats);
            }

            // 5) Actualizar puntos del usuario si hubo cambios
            if (addedPoints > 0) {
                user.fantasy.totalPoints += addedPoints;

                await this.api.patch("users", user.id, {
                    fantasy: user.fantasy
                });
            }

            totalProcessed++;
        }

        // 6) Actualizamos el lastUpdated global
        const now = new Date().toISOString();

        await this.api.patch("lastUpdated", config.id, {
            lastUpdatedFantasy: now
        });

        return { updated: totalProcessed, date: now };
    }



    calcFantasyPoints(s: any) {
        return (
            (s.points ?? 0) * 1 +
            (s.totReb ?? 0) * 1.2 +
            (s.assists ?? 0) * 1.5 +
            (s.blocks ?? 0) * 3 +
            (s.steals ?? 0) * 3 +
            (s.turnovers ?? 0) * -1
        );
    }

}
