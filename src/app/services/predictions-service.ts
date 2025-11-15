import { Injectable } from '@angular/core';
import { LocalApiService } from './local-api';
import { Prediction } from '../utils/interfaces';


@Injectable({ providedIn: 'root' })
export class PrediccionService {

    constructor(private api: LocalApiService) { }

    create(pred: Prediction) {
        return this.api.create('predicciones', pred);
    }

    getByUser(idUser: number) {
        return this.api.getByData('predicciones', `idUser=${idUser}`);
    }

    getForGame(idUser: number, idGame: number) {
        return this.api.getByData('predicciones', `idUser=${idUser}&idGame=${idGame}`);
    }

    update(id: number, pred: Partial<Prediction>) {
        return this.api.update('predicciones', id, pred);
    }

    delete(id: number) {
        return this.api.delete('predicciones', id);
    }
}