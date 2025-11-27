import { Component, Injector } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { NotificationService } from '../../../services/notification.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';
import { NotificationItem } from '../../../models/interfaces';
import { AdminLeagueService } from '../../../services/admin-league.service';

@WithLoader()
@Component({
  selector: 'app-fantasy-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './fantasy-home.html',
  styleUrls: ['./fantasy-home.css', '../../predictions/prediction/prediction.css'],
})
export class FantasyHome {

  isAdmin = false;

  notifications: NotificationItem[] = [];
  unreadCount = 0;
  showPanel = false;

  bellShakeOnce = false;

  loadingDelete: { [key: number]: boolean } = {};

  constructor(
    private leaguesService: FantasyLeaguesService,
    private notificationsService: NotificationService,
    private adminLeague: AdminLeagueService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    // ver si es admin (lo seguís usando para mostrar la card)
    const res = await this.leaguesService.getAdminStatus() as { isAdmin: boolean };
    this.isAdmin = res.isAdmin;

    // cargar notificaciones
    await this.loadNotifications();

    if (this.unreadCount > 0) {
      this.bellShakeOnce = true;
      setTimeout(() => this.bellShakeOnce = false, 1200);
    }
  }

  async loadNotifications() {
    try {
      this.notifications = await this.notificationsService.getNotifications();
      console.log("notif",this.notifications);

    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
  }

  async markAsRead(notificationId: number) {
    try {
      await this.notificationsService.markAsRead(notificationId);
      await this.loadNotifications();
    } catch (err) {
      console.error("Error marking as read", err);
    }
  }

  async deleteNotification(notificationId: number) {
    try {
      this.loadingDelete[notificationId] = true;

      await this.notificationsService.deleteNotification(notificationId);
      await this.loadNotifications();

    } catch (err) {
      console.error("Error deleting notification:", err);
    } finally {
      this.loadingDelete[notificationId] = false;
    }
  }

  async acceptInvite(inviteId: number) {
    try {
      await this.adminLeague.acceptInvite(inviteId);
      await this.loadNotifications();
    } catch (err) {
      console.error("Error accept invite", err);
    }
  }

  async rejectInvite(inviteId: number) {
    try {
      await this.adminLeague.rejectInvite(inviteId);
      await this.loadNotifications();
    } catch (err) {
      console.error("Error reject invite", err);
    }
  }

  async approveRequest(requestId: number) {
    try {
      await this.adminLeague.approveJoinRequest(requestId);
      await this.loadNotifications();
    } catch (err) {
      console.error("Error approve request", err);
    }
  }

  async rejectRequest(requestId: number) {
    try {
      await this.adminLeague.rejectJoinRequest(requestId);
      await this.loadNotifications();
    } catch (err) {
      console.error("Error reject request", err);
    }
  }

}
