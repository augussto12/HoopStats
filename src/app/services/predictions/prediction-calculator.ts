import { Injectable } from '@angular/core';
import { PrediccionService } from './predictions-service';
import { LocalApiService } from '../local-api';
import { NbaApiService } from '../nba-api';

@Injectable({ providedIn: 'root' })
export class PredictionCalulator {

    constructor(
        private predService: PrediccionService,
        private localApi: LocalApiService,
        private nba: NbaApiService
    ) { }

    async evaluatePendingPredictions() {

        const pendientes = await this.localApi.getByData('predicciones', 'procesada=false');
        if (!pendientes.length) return; // no hay pendientes entonces termina la funcion

        // cache para guardar datos
        const gameCache = new Map<number, any>();        // gameId guarda la info del partido
        const predictionCache = new Map<string, number>(); // home|away guarda los pts calculados

        for (const pred of pendientes) {
            try {
                const gameId = pred.idGame;

                // Obtener info del partido usando cache si es que ya se vio
                let game: any;
                if (gameCache.has(gameId)) {
                    game = gameCache.get(gameId);
                } else {
                    const apiData = await this.nba.getGameData(gameId);
                    game = apiData?.[0];
                    if (!game) continue;
                    gameCache.set(gameId, game);
                }

                // Si no termino no hay resultado final 
                if (game.status.long !== "Finished") continue;

                const realHome = game.scores.home.points;
                const realAway = game.scores.visitors.points;

                const cacheKey = `${pred.puntosLocalPrediccion}|${pred.puntosVisitantePrediccion}|${realHome}|${realAway}`;

                // Cache de puntos de predicción
                let puntos: number;
                if (predictionCache.has(cacheKey)) {
                    puntos = predictionCache.get(cacheKey)!;
                } else {
                    puntos = this.calculatePoints(
                        pred.puntosLocalPrediccion,
                        pred.puntosVisitantePrediccion,
                        realHome,
                        realAway
                    );
                    predictionCache.set(cacheKey, puntos);
                }

                // Actualizar predicción
                await this.predService.patch(pred.id, {
                    puntosObtenidos: puntos,
                    procesada: true
                });

                // Actualizar puntaje del usuario
                await this.addPointsToUser(pred.idUser, puntos);

            } catch (err) {
                console.error("Error procesando predicción", pred, err);
            }
        }
    }

    // Calcula puntos según predicción y resultado real
    private calculatePoints(predLocal: number, predVisit: number, realLocal: number, realVisit: number): number {
        let pts = 0;

        const predWinner = predLocal > predVisit ? 'home' : 'away';
        const realWinner = realLocal > realVisit ? 'home' : 'away';

        const exactScore = predLocal === realLocal && predVisit === realVisit;

        const approxScore =
            Math.abs(predLocal - realLocal) <= 5 &&
            Math.abs(predVisit - realVisit) <= 5;

        if (exactScore) return 15;

        if (predWinner === realWinner) pts += 2;
        if (approxScore) pts += 5;

        return pts;
    }

    // Suma puntos al usuario 
    private async addPointsToUser(idUser: string, pts: number) {
        const user = await this.localApi.getById('users', idUser);

        const total = (user.totalPredictionPoints || 0) + pts;

        await this.localApi.patch('users', idUser, {
            totalPredictionPoints: total
        });
    }
}
