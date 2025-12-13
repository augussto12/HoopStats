import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AdminLeagueService } from '../../services/admin-league.service';

import { NotificationItem } from '../../models/interfaces';
import { useGoBack } from '../../utils/navigation';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  menuOpen = false;
  showPanel = false;

  notifications: NotificationItem[] = [];
  unreadCount = 0;

  // ← Loaders separados
  loadingAccept: Record<number, boolean> = {};
  loadingReject: Record<number, boolean> = {};
  loadingRead: Record<number, boolean> = {};
  loadingDelete: Record<number, boolean> = {};

  public goBack: () => void = useGoBack();

  constructor(
    public router: Router,
    public auth: AuthService,
    private notificationsService: NotificationService,
    private adminLeague: AdminLeagueService
  ) { }

  async ngOnInit() {

    this.auth.loginStatus$.subscribe(async (logged) => {
      if (logged) {
        await this.loadNotifications();
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });

    // Quita el scroll cuando el menú cierra
    this.router.events.subscribe(() => {
      document.body.classList.remove("no-scroll");
    });
  }


  async loadNotifications() {
    try {
      this.notifications = await this.notificationsService.getNotifications();
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
    } catch (err) {
      console.error("Error loading notifications", err);
    }
  }

  togglePanel() {
    if (!this.auth.isLoggedIn()) return;
    this.showPanel = !this.showPanel;
  }

  // ============================================
  //   ACCIONES INDIVIDUALES CON LOADERS SEPARADOS
  // ============================================

  markAsRead(notificationId: number) {
    this.loadingRead[notificationId] = true;

    this.notificationsService
      .markAsRead(notificationId)
      .then(async () => {
        await this.loadNotifications();
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al marcar como leído:", err))
      .finally(() => this.loadingRead[notificationId] = false);
  }


  deleteNotification(notificationId: number) {
    this.loadingDelete[notificationId] = true;

    this.notificationsService
      .deleteNotification(notificationId)
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al borrar notificación:", err))
      .finally(() => this.loadingDelete[notificationId] = false);
  }


  acceptInvite(inviteId: number, notifId: number) {
    this.loadingAccept[notifId] = true;

    this.adminLeague.acceptInvite(inviteId)
      .then(() => this.notificationsService.deleteNotification(notifId))
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al aceptar invitación:", err))
      .finally(() => this.loadingAccept[notifId] = false);
  }


  rejectInvite(inviteId: number, notifId: number) {
    this.loadingReject[notifId] = true;

    this.adminLeague.rejectInvite(inviteId)
      .then(() => this.notificationsService.deleteNotification(notifId))
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al rechazar invitación:", err))
      .finally(() => this.loadingReject[notifId] = false);
  }


  approveRequest(requestId: number, notifId: number) {
    this.loadingAccept[notifId] = true;

    this.adminLeague.approveJoinRequest(requestId)
      .then(() => this.notificationsService.deleteNotification(notifId))
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al aprobar solicitud:", err))
      .finally(() => this.loadingAccept[notifId] = false);
  }


  rejectRequest(requestId: number, notifId: number) {
    this.loadingReject[notifId] = true;

    this.adminLeague.rejectJoinRequest(requestId)
      .then(() => this.notificationsService.deleteNotification(notifId))
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.updateUnreadCount();
      })
      .catch(err => console.error("Error al rechazar solicitud:", err))
      .finally(() => this.loadingReject[notifId] = false);
  }



  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }


  // ============================================
  //               MENÚ / LOGOUT
  // ============================================

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle("no-scroll", this.menuOpen);
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove("no-scroll");
  }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.showPanel = false;
    this.router.navigate(['/login']);
  }

}
