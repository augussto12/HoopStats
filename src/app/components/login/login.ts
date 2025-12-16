import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RememberService } from '../../services/remember.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  public identifier = '';
  public password = '';

  public error = '';
  public success = '';

  public loading = false;
  public showPassword = false;
  public capsOn = false;
  public fading = false;
  public rememberMe = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private remember: RememberService
  ) { }

  async ngOnInit() {
    const data = await this.remember.load();
    this.rememberMe = data.remember;
    this.identifier = data.identifier;
  }

  async login() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const identifierNormalized = this.identifier.trim().toLowerCase();

    try {
      // Guardar/limpiar según el checkbox (ANTES o DESPUÉS, da igual)
      await this.remember.save(this.rememberMe, identifierNormalized);

      const logged = await this.auth.login(identifierNormalized, this.password);

      if (logged) {
        this.loading = false;
        this.success = "Sesión iniciada";

        setTimeout(() => this.router.navigate(['/']), 900);
      } else {
        this.loading = false;
        this.error = "Usuario/email o contraseña incorrectos";
      }

    } catch {
      this.loading = false;
      this.error = "Usuario/email o contraseña incorrectos";
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  checkCaps(e: KeyboardEvent) {
    this.capsOn = e.getModifierState && e.getModifierState('CapsLock');
  }

  async onRememberChange() {
    const id = this.identifier.trim().toLowerCase();

    if (this.rememberMe && !id) return;

    await this.remember.save(this.rememberMe, id);
  }


}
