import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationItem } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    constructor(private api: ApiService) { }

    /** Obtener todas las notificaciones */
    getNotifications(): Promise<NotificationItem[]> {
        return this.api.get('/notifications');
    }

    /** Marcar una notificación como leída */
    markAsRead(notificationId: number) {
        return this.api.patch(`/notifications/${notificationId}/read`, {});
    }

    /** Marcar TODAS como leídas */
    markAllAsRead() {
        return this.api.patch(`/notifications/mark-all-read`, {});
    }

    /** Eliminar notificación */
    deleteNotification(notificationId: number) {
        return this.api.delete(`/notifications/${notificationId}`);
    }
}
