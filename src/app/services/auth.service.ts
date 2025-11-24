import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private tokenKey = 'token';
    private userKey = 'user';

    constructor(private api: ApiService, private router: Router) { }

    // REGISTER
    async register(data: {
        fullname: string;
        username: string;
        gender: string;
        email: string;
        password: string;
    }) {
        const res: any = await this.api.post('/auth/register', data);

        // Guardamos token y usuario
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));

        return res;
    }

    // LOGIN
    async login(identifier: string, password: string): Promise<boolean> {
        try {
            const res: any = await this.api.post('/auth/login', { identifier, password });

            localStorage.setItem(this.tokenKey, res.token);

            const profile: any = await this.api.get('/auth/me');
            localStorage.setItem(this.userKey, JSON.stringify(profile));

            return true;

        } catch (err) {
            return false;
        }
    }


    // PROFILE
    async getProfile() {
        const profile = await this.api.get('/auth/me');
        localStorage.setItem(this.userKey, JSON.stringify(profile));
        return profile;
    }

    // UPDATE PROFILE
    async updateProfile(data: any) {
        const updated: any = await this.api.put('/auth/me', data);
        localStorage.setItem(this.userKey, JSON.stringify(updated.user));
        return updated;
    }

    // UPDATE PASSWORD
    async updatePassword(oldPassword: string, newPassword: string) {
        return await this.api.patch('/users/update-password', { oldPassword, newPassword });
    }

    // DELETE ACCOUNT
    async deleteAccount() {
        return await this.api.delete('/auth/me');
    }

    // LOGOUT
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);

        this.router.navigate(['/']).then(() => {
            window.location.reload();
        });
    }

    // HELPERS
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

    isEmailVerified(): boolean {
        const user = this.getUser();
        return !!user?.email_verified;
    }

}
