import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  public identifier = '';
  public password = '';

  public error = '';
  public success = '';

  public loading = false;
  public showPassword = false;
  public capsOn = false;
  public fading = false;

  constructor(private auth: AuthService, private router: Router) { }

  async login() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const identifier = this.identifier.trim().toLowerCase();

    try {
      const logged = await this.auth.login(identifier, this.password);

      if (logged) {
        this.loading = false;
        this.success = "Sesión iniciada";

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 900);

      } else {
        this.loading = false;
        this.error = "Usuario/email o contraseña incorrectos";
      }

    } catch (err) {
      console.error(err);
      this.loading = false;
      this.error = 'Ocurrió un error al iniciar sesión';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  checkCaps(e: KeyboardEvent) {
    this.capsOn = e.getModifierState && e.getModifierState('CapsLock');
  }
}
