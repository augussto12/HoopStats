import { Injectable } from '@angular/core';
import { LocalApiService } from '../local-api';
import { NbaApiService } from '../nba-api';

@Injectable({ providedIn: 'root' })
export class FantasyPointsService {

  private gamesCache = new Map<number, any>();
  private playerStatsCache = new Map<number, any>();

  constructor(
    private api: LocalApiService,
    private nbaApi: NbaApiService
  ) { }

  async updateGlobalFantasyPoints() {

    if (await this.hayPartidosEnVivo()) return;

    const config = await this.getLastUpdated();
    const lastUpdate = new Date(config.lastUpdatedFantasy);

    console.log("paso");
    if (!this.pasoUnaHora(lastUpdate)) return;

    console.log("paso23123");
    const users = await this.api.getAll("users");

    // juntar todos los jugadores
    const allPlayers = users
      .filter(u => u.fantasy)
      .flatMap(u => u.fantasy.players);

    // Obtener IDs unicos de jugadores
    const playerIds: number[] = [];

    for (const p of allPlayers) {
      playerIds.push(p.id);
    }

    // Stats de todos esos jugadores
    const statsList = await this.getAllPlayersStats(playerIds);

    // Obtener IDs unicos de games
    const gameIds: number[] = [];

    for (const s of statsList) {
      if (s && s.game.id) {
        const id = s.game.id;
        if (!gameIds.includes(id)) {
          gameIds.push(id);
        }
      }
    }

    // pedir partidos
    const gamesMap = await this.getAllGames(gameIds);

    let seSumoAlgo = false;

    for (const user of users) {
      if (!user.fantasy) continue;

      const added = this.procesarUsuario(
        user,
        lastUpdate,
        statsList,
        gamesMap
      );

      if (added > 0) {
        seSumoAlgo = true;
        await this.actualizarUsuario(user, added);
      }
    }

    if (!seSumoAlgo) return;

    const now = await this.actualizarLastUpdated(config.id);
    return { updated: true, date: now };
  }

  private async hayPartidosEnVivo() {
    const live = await this.nbaApi.getLiveGames();
    return live && live.length > 0;
  }

  private async getLastUpdated() {
    const list = await this.api.getAll("lastUpdated");
    return list[0];
  }

  private pasoUnaHora(last: Date) {
    const ONE_HOUR = 3600000;
    console.log("ultimo", last);
    console.log("ahora", Date.now());
    return (Date.now() - last.getTime()) >= ONE_HOUR;
  }

  async getAllPlayersStats(ids: number[]) {
    const results: any[] = [];

    for (const id of ids) {

      // Si esta en cache usamos eso y seguimos
      if (this.playerStatsCache.has(id)) {
        results.push(this.playerStatsCache.get(id));
        continue;
      }

      // Si no esta en cache buscamos la info del jugador
      const res = await this.nbaApi.getPlayerStats(id);
      const last = res?.[res.length - 1] ?? null;

      this.playerStatsCache.set(id, last);
      results.push(last);
    }

    return results;
  }

  private async getAllGames(gameIds: number[]) {
    const map = new Map<number, any>();

    for (const id of gameIds) {

      // Si esta en cache usamos eso y seguimos
      if (this.gamesCache.has(id)) {
        map.set(id, this.gamesCache.get(id));
        continue;
      }

      // Si no esta en cache buscamos la info del partido
      const apiData = await this.nbaApi.getGameData(id);
      const game = apiData?.[0];

      if (game) {
        this.gamesCache.set(id, game);
        map.set(id, game);
      }
    }

    return map;
  }

  private procesarUsuario(user: any, lastUpdate: Date, statsList: any[], gamesMap: Map<number, any>) {
    let added = 0;

    for (const player of user.fantasy.players) {
      const stats = statsList.find(s => s?.player?.id === player.id);
      if (!stats) continue;

      //Tiene que haber jugado al menos 1 minuto para sumar puntos en el fantasy
      if (stats.min <= 1) continue;

      const game = gamesMap.get(stats.game.id);
      if (!game) continue;

      const gameDate = new Date(game.date.start);

      if (gameDate <= lastUpdate) continue;
      if (game.status.long !== "Finished") continue;

      const pts = Number(this.calcFantasyPoints(stats).toFixed(1));


      added += pts;
      player.totalPts += pts;
    }

    return added;
  }

  private async actualizarUsuario(user: any, added: number) {
    user.fantasy.totalPoints = Number((user.fantasy.totalPoints + added).toFixed(2));
    await this.api.patch("users", user.id, { fantasy: user.fantasy });
  }


  private async actualizarLastUpdated(configId: number) {
    const now = new Date().toISOString();
    await this.api.patch("lastUpdated", configId, {
      lastUpdatedFantasy: now
    });
    return now;
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

  // delay para bajar la cantidad de requests por segundo a la api
  // sino tira error por el rateLimit que tiene
  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

}
