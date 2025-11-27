import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = apiConfig.apiUrl;

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        if (!token) {
            return new HttpHeaders(); // sin token
        }

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    get<T>(url: string, params?: any): Promise<T> {
        return firstValueFrom(
            this.http.get<T>(`${this.baseUrl}${url}`, {
                headers: this.getAuthHeaders(),
                params
            })
        );
    }


    post<T>(url: string, body: any): Promise<T> {
        return firstValueFrom(
            this.http.post<T>(`${this.baseUrl}${url}`, body, {
                headers: this.getAuthHeaders()
            })
        );
    }

    put<T>(url: string, body: any): Promise<T> {
        return firstValueFrom(  
            this.http.put<T>(`${this.baseUrl}${url}`, body, {
                headers: this.getAuthHeaders()
            })
        );
    }

    patch<T>(url: string, body: any): Promise<T> {
        return firstValueFrom(
            this.http.patch<T>(`${this.baseUrl}${url}`, body, {
                headers: this.getAuthHeaders()
            })
        );
    }

    delete<T>(url: string): Promise<T> {
        return firstValueFrom(
            this.http.delete<T>(`${this.baseUrl}${url}`, {
                headers: this.getAuthHeaders()
            })
        );
    }
}
