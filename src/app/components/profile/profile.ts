import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalApiService } from '../../services/local-api';
import { Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  public user: any;
  public editing = false;
  public showConfirm = false;
  public error = '';

  constructor(private api: LocalApiService, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  editProfile() {
    this.editing = true;
  }

  async saveChanges() {
    try {
      await this.api.update('users', this.user.id, this.user);
      localStorage.setItem('user', JSON.stringify(this.user));
      this.editing = false;
      this.error = 'Datos actualizados con éxito';
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      this.error = 'Error al guardar los cambios';
    }
  }

  cancelEdit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.editing = false;
  }

  deleteProfile() {
    this.showConfirm = true;
  }

  confirmDelete() {
    this.api.delete('users', this.user.id)
      .then(() => {
        localStorage.removeItem('user');
        this.showConfirm = false;
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Error al eliminar la cuenta:', error);
        this.showConfirm = false;
      });
  }
}