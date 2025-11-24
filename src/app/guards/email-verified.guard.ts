import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EmailVerifiedGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { }

    canActivate(): boolean {

        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        if (!this.auth.isEmailVerified()) {
            this.router.navigate(['/profile'], {
                state: { msg: "Debes verificar tu email para acceder a esta sección." }
            });
            return false;
        }

        return true;
    }
}
