import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private tokenKey = 'token';
    private userKey = 'user';

    public tokenExpiring$ = new BehaviorSubject<boolean>(false);
    public countdown$ = new BehaviorSubject<number>(0);

    private countdownInterval: any;

    private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
    public loginStatus$ = this.loggedIn$.asObservable();

    constructor(private api: ApiService, private router: Router) { }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    // =============================
    //    WATCH TOKEN COUNTDOWN
    // =============================
    startTokenWatcher() {
        const token = this.getToken();
        if (!token) return;

        // Obtener exp
        const payload: any = JSON.parse(atob(token.split('.')[1]));
        const expTs = payload.exp * 1000;

        // Si ya hay un interval → reset
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        // Interval cada 1 segundo
        this.countdownInterval = setInterval(() => {

            const remainingMs = expTs - Date.now();
            const remainingSec = Math.floor(remainingMs / 1000);

            this.countdown$.next(remainingSec);

            // Expirado
            if (remainingSec <= 0) {
                clearInterval(this.countdownInterval);
                this.logout();
                return;
            }

            // Mostrar modal si queda 1 minuto
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
        localStorage.setItem(this.tokenKey, res.token);

        this.tokenExpiring$.next(false);

        // Reiniciar countdown
        this.startTokenWatcher();
    }

    // =============================
    //          REGISTER
    // =============================
    async register(data: any) {
        const res: any = await this.api.post('/auth/register', data);

        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.loggedIn$.next(true);

        this.startTokenWatcher();

        return res;
    }

    // PROFILE
    async getProfile() {
        const profile = await this.api.get('/auth/me');
        localStorage.setItem(this.userKey, JSON.stringify(profile));
        return profile;
    }

    async updateProfile(data: any) {
        const updated: any = await this.api.put('/auth/me', data);
        localStorage.setItem(this.userKey, JSON.stringify(updated.user));
        return updated;
    }

    async updatePassword(oldPassword: string, newPassword: string) {
        return await this.api.patch('/users/update-password', { oldPassword, newPassword });
    }

    async deleteAccount() {
        return await this.api.delete('/auth/me');
    }

    async login(identifier: string, password: string): Promise<boolean> {
        try {
            const res: any = await this.api.post('/auth/login', { identifier, password });

            localStorage.setItem(this.tokenKey, res.token);

            const profile: any = await this.api.get('/auth/me');
            localStorage.setItem(this.userKey, JSON.stringify(profile));

            this.loggedIn$.next(true);

            this.startTokenWatcher();   // ← activar countdown

            return true;

        } catch (err) {
            return false;
        }
    }

    // =============================
    //          PROFILE
    // =============================
    async initSession() {
        const token = this.getToken();
        if (!token) {
            this.loggedIn$.next(false);
            return;
        }

        try {
            const profile: any = await this.api.get('/auth/me');
            localStorage.setItem(this.userKey, JSON.stringify(profile));

            this.loggedIn$.next(true);
            this.startTokenWatcher();

        } catch (err) {
            this.logout();
        }
    }

    // =============================
    //          LOGOUT
    // =============================
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);

        this.loggedIn$.next(false);
        this.tokenExpiring$.next(false);
        this.countdown$.next(0);

        if (this.countdownInterval) clearInterval(this.countdownInterval);

        this.router.navigate(['/']).then(() => {
            window.location.reload();
        });
    }

    // Helpers
    getUser() {
        const u = localStorage.getItem(this.userKey);
        return u ? JSON.parse(u) : null;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn() {
        return this.loggedIn$.value;
    }

    isEmailVerified(): boolean {
        const user = this.getUser();
        return !!user?.email_verified;
    }
}
