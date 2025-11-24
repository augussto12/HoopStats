import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['../../login/login.css']
})
export class ForgotPassword {

  email = '';
  loading = false;
  message = '';
  error = '';

  constructor(private api: ApiService) { }

  async submit() {
    this.error = '';
    this.message = '';

    const email = this.email.trim().toLowerCase();

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.error = "Ingresa un email válido";
      return;
    }

    this.loading = true;

    try {
      await this.api.post('/auth/forgot-password', { email });
      this.message = "Recibirás un enlace para restablecer tu contraseña.";
    } catch (err) {
      this.error = "Ocurrió un error. Intenta más tarde.";
    } finally {
      this.loading = false;
    }
  }
}
