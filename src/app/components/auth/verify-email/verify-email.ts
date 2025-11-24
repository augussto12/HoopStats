import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrls: ['../../login/login.css']
})
export class VerifyEmail implements OnInit {

  loading = true;
  success = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.error = 'Datos inválidos';
      this.loading = false;
      return;
    }

    try {
      this.api.get(`/auth/verify-email`, { token, email })

      this.success = '¡Email verificado correctamente!';
      this.loading = false;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      this.loading = false;
      this.error = err?.error?.error || 'El enlace es inválido o expiró.';
    }
  }

  async resend() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const email = this.route.snapshot.queryParamMap.get('email');
    if (!email) {
      this.error = 'Email inválido';
      this.loading = false;
      return;
    }

    try {
      await this.api.post('/auth/resend-verification', { email });
      this.loading = false;
      this.success = 'Te enviamos un nuevo email de verificación.';
    } catch (err) {
      console.error(err);
      this.loading = false;
      this.error = 'No se pudo reenviar el email.';
    }
  }
}
