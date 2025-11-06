import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalApiService } from './local-api';
import * as bcrypt from 'bcryptjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private api: LocalApiService, private router: Router) { }

    async register(user: any): Promise<boolean> {
        try {
            user.password = await bcrypt.hash(user.password, 10);
            await this.api.create('users', user);
            return true;
        } catch {
            return false;
        }
    }
    

    async login(username: string, password: string): Promise<boolean> {
        const users = await this.api.getByData('users', `username=${username}`);
        if (users.length === 0) return false;

        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);

        if (valid) {
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        }

        return false;
    }

    logout() {
        localStorage.removeItem('user');
        this.router.navigate(['/']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('user');
    }
}