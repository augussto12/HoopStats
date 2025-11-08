import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from  '../services/auth.service';
import { RouterLink } from '@angular/router';
import { LocalApiService } from '../services/local-api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../login/login.css']
})
export class Register {
  fullname = '';
  username = '';
  email = '';
  password = '';
  error = '';
  success = '';

  users: any[] = [];

  constructor(private auth: AuthService, private api: LocalApiService) { }

  async register() {
    if (!this.username || !this.email || !this.password || !this.fullname) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    const user = {
      fullname: this.fullname,
      username: this.username,
      email: this.email,
      password: this.password,
      favorites: { teams: [], players: [] }
    };

    try {
      this.users = await this.api.getByData('users', `username=${this.username}`);
      if (this.users.length > 0) {
        this.error = 'El nombre de usuario ya está en uso';
        this.success = '';
        return;
      }

      await this.auth.register(user);
      this.success = 'Usuario registrado con éxito';
      this.error = '';

    } catch (err) {
      console.error(err);
      this.error = 'Error al registrar el usuario';
      this.success = '';
    }
  }
}