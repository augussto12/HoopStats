import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {

  public user: any = null;

  public editing = false;
  public changingPassword = false;
  public showConfirm = false;   // ✅ FALTABA ESTO

  public error = '';
  public success = '';

  // Password
  public oldPassword = '';
  public newPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      this.user = await this.auth.getProfile();
    } catch (e) {
      this.error = 'No se pudo cargar tu perfil.';
    }
  }

  // ------------------------------------------------
  // EDITAR PERFIL
  // ------------------------------------------------
  editProfile() {
    this.editing = true;
    this.success = '';
  }

  async saveChanges() {
    try {
      const updated = await this.auth.updateProfile({
        fullname: this.user.fullname,
        username: this.user.username,
        email: this.user.email,
        gender: this.user.gender
      });

      this.user = updated.user;
      this.editing = false;
      this.success = 'Datos actualizados correctamente';

    } catch (e) {
      console.error(e);
      this.error = 'Error al guardar los cambios';
    }
  }

  cancelEdit() {
    this.editing = false;
    this.ngOnInit(); // recargar del backend nuevamente
  }

  // ------------------------------------------------
  // CAMBIAR CONTRASEÑA
  // ------------------------------------------------
  startPasswordChange() {
    this.changingPassword = true;
    this.success = '';
    this.error = '';
  }

  async changePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.error = 'Debes completar ambos campos';
      return;
    }

    try {
      await this.auth.updatePassword(this.oldPassword, this.newPassword);

      this.success = 'Contraseña actualizada correctamente';
      this.error = '';
      this.changingPassword = false;

      this.oldPassword = '';
      this.newPassword = '';

    } catch (err: any) {
      console.error(err);
      this.error = err?.error?.error || 'No se pudo cambiar la contraseña';
    }
  }

  // ------------------------------------------------
  // ELIMINAR CUENTA
  // ------------------------------------------------
  deleteProfile() {
    this.showConfirm = true;
  }

  async confirmDelete() {
    try {
      await this.auth.deleteAccount();

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      this.showConfirm = false;
      this.router.navigate(['/']);

    } catch (err) {
      console.error(err);
      this.error = "No se pudo eliminar la cuenta";
      this.showConfirm = false;
    }
  }
}
