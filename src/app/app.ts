import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { AdminLeagueService } from './services/admin-league.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { SessionExpiringModal } from './modal-session-expiring.component';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NotificationItem } from './models/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    Header,
    GlobalLoaderComponent,
    SessionExpiringModal,
    DatePipe
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  // ======================
  //   INYECCIONES
  // ======================
  private loading = inject(LoadingService);
  public auth = inject(AuthService);
  private notificationsService = inject(NotificationService);
  private adminLeague = inject(AdminLeagueService);
  private router = inject(Router);

  // ======================
  //   ESTADO NOTIFICACIONES
  // ======================
  showPanel = false;
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  isLogged = false;

  loadingAccept: Record<number, boolean> = {};
  loadingReject: Record<number, boolean> = {};
  loadingRead: Record<number, boolean> = {};
  loadingDelete: Record<number, boolean> = {};

  constructor() {
    this.auth.initSession();

    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: '#000000' });

      // Style.Dark = íconos claros (nombre confuso, pero es así)
      StatusBar.setStyle({ style: Style.Dark });
    }


    // Loader global
    this.loading.loading$
      .pipe(takeUntilDestroyed())
      .subscribe(isLoading => {
        document.body.classList.toggle('no-scroll', isLoading);
      });

    // Login / logout
    this.auth.loginStatus$
      .pipe(takeUntilDestroyed())
      .subscribe(async logged => {
        this.isLogged = logged;

        if (logged) {
          await this.loadNotifications();
        } else {
          this.notifications = [];
          this.unreadCount = 0;
          this.showPanel = false;
        }
      });

  }

  // ======================
  //   NOTIFICACIONES
  // ======================

  async loadNotifications() {
    try {
      this.notifications = await this.notificationsService.getNotifications();
      this.updateUnreadCount();
    } catch (err) {
      console.error('Error loading notifications', err);
    }
  }

  togglePanel() {
    if (!this.isLogged) return;
    this.showPanel = !this.showPanel;
  }


  markAsRead(notificationId: number) {
    this.loadingRead[notificationId] = true;

    this.notificationsService.markAsRead(notificationId)
      .then(() => this.loadNotifications())
      .finally(() => this.loadingRead[notificationId] = false);
  }

  deleteNotification(notificationId: number) {
    this.loadingDelete[notificationId] = true;

    this.notificationsService.deleteNotification(notificationId)
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
      })
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
      .finally(() => this.loadingReject[notifId] = false);
  }

  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }
}
