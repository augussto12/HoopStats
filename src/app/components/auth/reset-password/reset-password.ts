import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['../../login/login.css']
})
export class ResetPassword implements OnInit {

  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.error = 'Token inválido o faltante';
    }
  }

  async submit() {
    this.error = '';
    this.success = '';

    if (!this.password || this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    try {
      await this.api.post('/auth/reset-password', {
        token: this.token,
        password: this.password
      });

      this.success = 'Contraseña actualizada correctamente.';
      this.loading = false;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      this.error = err?.error?.error || 'No se pudo actualizar la contraseña';
      this.loading = false;
    }
  }
}
