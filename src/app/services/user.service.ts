import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private api: ApiService) { }

    // Obtener mi perfil
    async getMyProfile() {
        return await this.api.get('/users/me');
    }

    // Actualizar mi perfil
    async updateProfile(data: {
        fullname?: string;
        username?: string;
        gender?: string;
        email?: string;
    }) {
        return await this.api.put('/users/me', data);
    }

    // Cambiar contraseña
    async changePassword(oldPassword: string, newPassword: string) {
        return await this.api.patch('/users/me/password', {
            oldPassword,
            newPassword
        });
    }
}
