import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../api.config';

@Injectable({ providedIn: 'root' })
export class LocalApiService {
    private baseUrl = environment.localApi.baseUrl;

    constructor(private http: HttpClient) { }

    async getAll(users: string): Promise<any[]> {
        return await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/${users}`));
    }

    async create(entity: string, data: any): Promise<any> {
        return await firstValueFrom(this.http.post(`${this.baseUrl}/${entity}`, data));
    }

    async getByData(entity: string, data: string): Promise<any[]> {
        return await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/${entity}?${data}`));
    }

    async update(entity: string, id: string | number, data: any): Promise<any> {
        return await firstValueFrom(this.http.put(`${this.baseUrl}/${entity}/${id}`, data));
    }

    async delete(entity: string, id: string | number): Promise<any> {
        return await firstValueFrom(this.http.delete(`${this.baseUrl}/${entity}/${id}`));
    }

}