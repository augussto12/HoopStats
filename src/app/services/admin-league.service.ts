import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminLeagueService {

    constructor(private api: ApiService) { }

    // ──────────────────────────────────────────────
    //              INVITACIONES
    // ──────────────────────────────────────────────

    inviteUserToLeague(leagueId: number, userId: number) {
        return this.api.post(`/fantasy-league-membership/leagues/${leagueId}/invite`, { userId });
    }

    cancelInvite(inviteId: number) {
        return this.api.delete(`/fantasy-league-membership/invites/${inviteId}/cancel`);
    }

    acceptInvite(inviteId: number) {
        return this.api.post(`/fantasy-league-membership/invites/${inviteId}/accept`, {});
    }

    rejectInvite(inviteId: number) {
        return this.api.post(`/fantasy-league-membership/invites/${inviteId}/reject`, {});
    }

    getInvitesForMyLeagues(): Promise<any[]> {
        return this.api.get(`/fantasy-league-membership/my/league-invites`);
    }

    deleteInviteNotification(inviteId: number) {
        return this.api.delete(`/fantasy-league-membership/invites/${inviteId}/notification`);
    }

    // ──────────────────────────────────────────────
    //              REQUESTS (ADMIN)
    // ──────────────────────────────────────────────

    approveJoinRequest(requestId: number) {
        return this.api.post(`/fantasy-league-membership/requests/${requestId}/approve`, {});
    }

    rejectJoinRequest(requestId: number) {
        return this.api.post(`/fantasy-league-membership/requests/${requestId}/reject`, {});
    }

    cancelJoinRequest(requestId: number) {
        return this.api.delete(`/fantasy-league-membership/requests/${requestId}/cancel`);
    }

    // ──────────────────────────────────────────────
    //                 ADMIN ACTIONS
    // ──────────────────────────────────────────────

    transferAdmin(leagueId: number, targetUserId: number) {
        return this.api.post(`/fantasy-leagues/${leagueId}/transfer-admin`, { targetUserId });
    }

    inactivateMember(leagueId: number, userId: number) {
        return this.api.patch(`/fantasy-leagues/${leagueId}/members/${userId}/inactivate`, {});
    }

    setActive(leagueId: number, userId: number) {
        return this.api.patch(`/fantasy-leagues/${leagueId}/members/${userId}/activate`, {});
    }

    deleteMember(leagueId: number, userId: number) {
        return this.api.delete(`/fantasy-leagues/${leagueId}/members/${userId}`);
    }

    promoteUser(leagueId: number, userId: number) {
        return this.api.post(`/fantasy-league-membership/leagues/${leagueId}/promote/${userId}`, {});
    }

    demoteUser(leagueId: number, userId: number) {
        return this.api.post(`/fantasy-league-membership/leagues/${leagueId}/demote/${userId}`, {});
    }
}
