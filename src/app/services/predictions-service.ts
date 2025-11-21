import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DbPrediction } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PredictionService {

    constructor(private api: ApiService) { }

    // Crear predicción
    createPrediction(data: any): Promise<any> {
        return this.api.post('/predictions', data);
    }

    // Obtener todas mis predicciones
    getMyPredictions(): Promise<DbPrediction[]> {
        return this.api.get<DbPrediction[]>('/predictions/mine');
    }

    // Obtener predicción para un partido
    getPredictionForGame(gameId: number): Promise<DbPrediction | null> {
        return this.api.get<DbPrediction | null>(`/predictions/game/${gameId}`);
    }

    // Eliminar predicción
    deletePrediction(id: number): Promise<any> {
        return this.api.delete(`/predictions/${id}`);
    }
}
