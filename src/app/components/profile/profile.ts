import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
  public showConfirm = false;

  public error = '';
  public success = '';

  // Passwords
  public oldPassword = '';
  public newPassword = '';

  public resendMessage = '';
  public resendError = '';
  public resendLoading = false;
  public passLoading = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      this.user = await this.auth.getProfile();
    } catch (e) {
      this.error = 'No se pudo cargar tu perfil.';
    }
  }

  genderMap: any = {
    male: "Masculino",
    female: "Femenino",
    other: "Otro"
  };

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
    this.ngOnInit();
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

    this.passLoading = true;
    this.error = '';
    this.success = '';

    try {
      await this.auth.updatePassword(this.oldPassword, this.newPassword);

      this.success = 'Contraseña actualizada correctamente';
      this.changingPassword = false;

      this.oldPassword = '';
      this.newPassword = '';

    } catch (err: any) {
      console.error(err);
      this.error = err?.error?.error || 'No se pudo cambiar la contraseña';
    } finally {
      this.passLoading = false;
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

      this.auth.logout();


      this.showConfirm = false;
      this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
      this.error = "No se pudo eliminar la cuenta";
      this.showConfirm = false;
    }
  }

  // ------------------------------------------------
  // REENVIAR VERIFICACIÓN
  // ------------------------------------------------
  async resendVerification() {
    this.resendMessage = '';
    this.resendError = '';
    this.resendLoading = true;

    try {
      await this.api.post("/auth/resend-verification", {
        email: this.user.email
      });

      this.resendMessage = "Email de verificación reenviado.";
    } catch (err) {
      this.resendError = "No se pudo reenviar el email.";
    } finally {
      this.resendLoading = false;
    }
  }
}
