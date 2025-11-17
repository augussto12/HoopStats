import { Injectable } from '@angular/core';
import { PrediccionService } from './predictions-service';
import { LocalApiService } from './local-api';
import { NbaApiService } from './nba-api';

@Injectable({ providedIn: 'root' })
export class PredictionCalulator {

    private readonly COOLDOWN_MINUTES = 30;

    constructor(
        private predService: PrediccionService,
        private localApi: LocalApiService,
        private nba: NbaApiService
    ) { }

    async evaluatePendingPredictions() {

        const lastRunStr = localStorage.getItem('predictionsLastRun');
        const now = Date.now();

        // Guardar timestamp de ejecucion
        localStorage.setItem('predictionsLastRun', now.toString());

        const pendientes = await this.localApi.getByData('predicciones', 'procesada=false');
        console.log("pendientes: ", pendientes);

        for (const pred of pendientes) {
            try {
                const apiData = await this.nba.getGameData(pred.idGame);
                const game = apiData[0];

                if (!game) continue;

                // Solo procesamos si termino
                if (game.status.long !== "Finished") continue;

                const realHome = game.scores.home.points;
                const realAway = game.scores.visitors.points;

                // Calcular puntos segun prediccion
                const puntos = this.calculatePoints(
                    pred.puntosLocalPrediccion,
                    pred.puntosVisitantePrediccion,
                    realHome,
                    realAway
                );

                // Actualizar prediccion
                await this.predService.patch(pred.id, {
                    puntosObtenidos: puntos,
                    procesada: true
                });

                // Sumar puntos al usuario
                await this.addPointsToUser(pred.idUser, puntos);

            } catch (err) {
                console.error("Error procesando predicción", pred, err);
            }
        }
    }

    private calculatePoints(predLocal: number, predVisit: number, realLocal: number, realVisit: number): number {
        let pts = 0;

        const predWinner = predLocal > predVisit ? 'home' : 'away';
        const realWinner = realLocal > realVisit ? 'home' : 'away';

        const exactScore =
            predLocal === realLocal &&
            predVisit === realVisit;

        const approxScore =
            Math.abs(predLocal - realLocal) <= 5 &&
            Math.abs(predVisit - realVisit) <= 5;

        // Si acerto exacto se lleva 15 pts
        if (exactScore) {
            pts += 15;
            return pts;
        }

        // Si acerto ganador 2 pts
        if (predWinner === realWinner) {
            pts += 2;
        }

        // Si acerto aproximado 5 pts
        if (approxScore) {
            pts += 5;
        }

        return pts;
    }


    private async addPointsToUser(idUser: string, pts: number) {
        const user = await this.localApi.getById('users', idUser);

        const total = (user.totalPredictionPoints || 0) + pts;

        await this.localApi.patch('users', idUser, {
            totalPredictionPoints: total
        });
    }
}
