import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private tokenKey = 'token';
    private userKey = 'user';

    private storage: Storage = sessionStorage;

    public tokenExpiring$ = new BehaviorSubject<boolean>(false);
    public countdown$ = new BehaviorSubject<number>(0);

    private countdownInterval: any;

    private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
    public loginStatus$ = this.loggedIn$.asObservable();

    constructor(private api: ApiService, private router: Router) { }

    // ------------------------------------------------
    // Storage helpers
    // ------------------------------------------------
    private getAny(key: string): string | null {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
    }

    private set(key: string, value: string) {
        this.storage.setItem(key, value);
    }

    private removeEverywhere(key: string) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    }

    setRememberMe(remember: boolean) {
        const nextStorage = remember ? localStorage : sessionStorage;

        const token = this.getToken();
        const user = this.getAny(this.userKey);

        this.removeEverywhere(this.tokenKey);
        this.removeEverywhere(this.userKey);

        this.storage = nextStorage;

        if (token) this.set(this.tokenKey, token);
        if (user) this.set(this.userKey, user);
    }

    private hasToken(): boolean {
        return !!this.getToken();
    }

    // ------------------------------------------------
    // JWT helpers
    // ------------------------------------------------
    private decodeJwtPayload(token: string): any | null {
        try {
            const payload = token.split('.')[1];
            if (!payload) return null;

            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(base64);
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    // =============================
    //    WATCH TOKEN COUNTDOWN
    // =============================
    startTokenWatcher() {
        const token = this.getToken();
        if (!token) return;

        const payload = this.decodeJwtPayload(token);
        if (!payload?.exp) return;

        const expTs = payload.exp * 1000;

        if (this.countdownInterval) clearInterval(this.countdownInterval);

        this.countdownInterval = setInterval(() => {
            const remainingMs = expTs - Date.now();
            const remainingSec = Math.floor(remainingMs / 1000);

            this.countdown$.next(remainingSec);

            if (remainingSec <= 0) {
                clearInterval(this.countdownInterval);
                this.logout();
                return;
            }

            if (remainingSec <= 60) {
                this.tokenExpiring$.next(true);
            }
        }, 1000);
    }

    // =============================
    //     REFRESCAR SESIÓN
    // =============================
    async refreshSession() {
        const res: any = await this.api.post('/auth/refresh', {});
        this.set(this.tokenKey, res.token);

        this.loggedIn$.next(true);
        this.tokenExpiring$.next(false);

        this.startTokenWatcher();
    }

    // =============================
    //          REGISTER
    // =============================
    async register(data: any) {
        await this.api.post('/auth/register', data);
        return true;
    }

    // =============================
    //            PROFILE
    // =============================
    async getProfile() {
        // ⬇️ ahora pega a /users/me (GET)
        const profile = await this.api.get('/users/me');
        this.set(this.userKey, JSON.stringify(this.safeUser(profile)));
        return profile;
    }

    async updateProfile(data: any) {
        // ⬇️ backend: PATCH /api/users/me
        const updated: any = await this.api.patch('/users/me', data);
        this.set(this.userKey, JSON.stringify(this.safeUser(updated.user)));
        return updated;
    }

    async updatePassword(oldPassword: string, newPassword: string) {
        // ⬇️ backend: PATCH /api/users/password
        return await this.api.patch('/users/password', { oldPassword, newPassword });
    }

    async deleteAccount() {
        // ⬇️ backend: DELETE /api/users/me
        return await this.api.delete('/users/me');
    }

    // =============================
    //            LOGIN
    // =============================
    async login(identifier: string, password: string): Promise<boolean> {
        try {
            const res: any = await this.api.post('/auth/login', { identifier, password });

            this.set(this.tokenKey, res.token);

            // ⬇️ ahora perfil desde /users/me
            const profile: any = await this.api.get('/users/me');
            this.set(this.userKey, JSON.stringify(this.safeUser(profile)));

            this.loggedIn$.next(true);
            this.startTokenWatcher();

            return true;
        } catch {
            return false;
        }
    }

    // =============================
    //          INIT SESSION
    // =============================
    async initSession() {
        const token = this.getToken();
        if (!token) {
            this.loggedIn$.next(false);
            return;
        }

        if (!this.isLoggedIn()) {
            this.logout();
            return;
        }

        try {
            // ⬇️ igual que arriba, /users/me
            const profile: any = await this.api.get('/users/me');
            this.set(this.userKey, JSON.stringify(this.safeUser(profile)));

            this.loggedIn$.next(true);
            this.startTokenWatcher();
        } catch {
            this.logout();
        }
    }

    // =============================
    //          LOGOUT
    // =============================
    logout() {
        this.removeEverywhere(this.tokenKey);
        this.removeEverywhere(this.userKey);

        this.loggedIn$.next(false);
        this.tokenExpiring$.next(false);
        this.countdown$.next(0);

        if (this.countdownInterval) clearInterval(this.countdownInterval);
    }

    // Helpers
    getUser() {
        const u = this.getAny(this.userKey);
        return u ? JSON.parse(u) : null;
    }

    getToken() {
        return this.getAny(this.tokenKey);
    }

    isLoggedIn() {
        const token = this.getToken();
        if (!token) return false;

        const payload = this.decodeJwtPayload(token);
        if (!payload?.exp) return false;

        return payload.exp * 1000 > Date.now();
    }

    isEmailVerified(): boolean {
        const user = this.getUser();
        return !!user?.email_verified;
    }

    private safeUser(u: any) {
        if (!u) return null;
        const { id, username, email, email_verified, fullname, gender } = u;
        return { id, username, email, email_verified, fullname, gender };
    }
}
