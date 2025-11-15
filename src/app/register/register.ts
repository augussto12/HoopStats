import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocalApiService } from '../services/local-api';
import { User } from '../utils/interfaces';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../login/login.css']
})
export class Register {

  error = '';
  success = '';

  registerForm;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private api: LocalApiService) {
    this.registerForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['', Validators.required],
    });
  }


  async register() {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullname, username, email, password, gender } = this.registerForm.value;

    try {
      const users = await this.api.getByData('users', `username=${username}`);

      if (users.length > 0) {
        this.error = 'El nombre de usuario ya está en uso';
        return;
      }

      const user: User = {
        fullname: fullname!,
        username: username!,
        email: email!,
        password: password!,
        gender: gender! as User['gender'],
        favorites: { teams: [], players: [] }
      };

      await this.auth.register(user);

      this.success = 'Usuario registrado con éxito';
      this.registerForm.reset();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (err) {
      console.error(err);
      this.error = 'Error al registrar el usuario';
    }
  }

  get f() {
    return this.registerForm.controls;
  }
}