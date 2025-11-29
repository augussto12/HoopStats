import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'session-expiring-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overlay" *ngIf="auth.tokenExpiring$ | async">
      <div class="modal">
        
        <h2>Tu sesión está por expirar</h2>

        <p class="countdown">
          Expira en <strong>{{ auth.countdown$ | async }}</strong> segundos
        </p>

        <p>¿Querés extender tu sesión?</p>

        <div class="btn-row">
            <button class="extend" (click)="extend()">Extender sesión</button>
            <button class="logout" (click)="logout()">Cerrar sesión</button>
        </div>

      </div>
    </div>
  `,
    styleUrls: ['./session-expiring-modal.css']
})
export class SessionExpiringModal {
    auth = inject(AuthService);

    async extend() {
        try {
            await this.auth.refreshSession();
            this.auth.tokenExpiring$.next(false);
        } catch (err) {
            this.auth.logout();
        }
    }

    logout() {
        this.auth.logout();
    }
}
