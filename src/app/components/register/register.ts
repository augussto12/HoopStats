import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../login/login.css']
})
export class Register {

  public error = '';
  public success = '';
  public registerForm;
  public submitted = false;
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3)]],
      username: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['', Validators.required],
    });

  }

  async register() {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerForm.patchValue({
      username: this.registerForm.value.username?.toLowerCase().trim()
    });

    const payload = {
      fullname: this.registerForm.value.fullname ?? '',
      username: this.registerForm.value.username ?? '',
      email: this.registerForm.value.email ?? '',
      password: this.registerForm.value.password ?? '',
      gender: this.registerForm.value.gender ?? ''
    };

    try {
      this.loading = true;

      await this.auth.register(payload);

      this.loading = false;
      this.success = 'Registrado con éxito';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      this.loading = false;
      this.error = err?.error?.error || 'Error al registrar el usuario';
    }
  }

  get f() {
    return this.registerForm.controls;
  }
}
