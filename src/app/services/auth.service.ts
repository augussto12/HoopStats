import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private tokenKey = 'token';
    private userKey = 'user';

    constructor(private api: ApiService, private router: Router) { }

    // ------------------------------------
    // REGISTER
    // ------------------------------------
    async register(data: {
        fullname: string;
        username: string;
        gender: string;
        email: string;
        password: string;
    }) {
        const res: any = await this.api.post('/auth/register', data);

        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));

        return res;
    }

    // ------------------------------------
    // LOGIN (usa username, NO email)
    // ------------------------------------
    async login(username: string, password: string): Promise<boolean> {
        try {
            const res: any = await this.api.post('/auth/login', { username, password });

            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem(this.userKey, JSON.stringify(res.user));

            return true;
        } catch (e) {
            return false;
        }
    }

    // ------------------------------------
    // OBTENER PERFIL
    // ------------------------------------
    async getProfile() {
        const profile = await this.api.get('/auth/me');
        localStorage.setItem(this.userKey, JSON.stringify(profile));
        return profile;
    }

    // ------------------------------------
    // EDITAR PERFIL
    // ------------------------------------
    async updateProfile(data: any) {
        const updated: any = await this.api.put('/auth/me', data);
        localStorage.setItem(this.userKey, JSON.stringify(updated.user));
        return updated;
    }

    // ------------------------------------
    // CAMBIAR PASSWORD
    // ------------------------------------
    async updatePassword(oldPassword: string, newPassword: string) {
        return await this.api.patch('/auth/password', { oldPassword, newPassword });
    }

    async deleteAccount() {
        return await this.api.delete('/auth/me');
    }

    // ------------------------------------
    // LOGOUT
    // ------------------------------------
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.router.navigate(['/']);
    }

    // ------------------------------------
    // HELPERS
    // ------------------------------------
    getUser() {
        const u = localStorage.getItem(this.userKey);
        return u ? JSON.parse(u) : null;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn() {
        return !!localStorage.getItem(this.tokenKey);
    }
}
