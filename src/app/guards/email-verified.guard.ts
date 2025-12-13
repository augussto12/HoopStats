import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EmailVerifiedGuard implements CanActivate {

    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean | UrlTree {

        if (!this.auth.isLoggedIn()) {
            return this.router.parseUrl('/login');
        }

        if (!this.auth.isEmailVerified()) {
            return this.router.parseUrl('/profile');
        }

        return true;
    }
}
