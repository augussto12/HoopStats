import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { Router } from '@angular/router';
import { MyLeague } from '../../../models/interfaces';

@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leagues.html',
  styleUrls: ['./leagues.css'],
})
export class Leagues implements OnInit {

  leagues: any[] = [];
  myLeaguesMap: Record<number, MyLeague> = {};
  errorMsg = "";
  loadingReq: Record<number, boolean> = {};
  leaveModalLeagueId: number | null = null;

  constructor(
    private leagueService: FantasyLeaguesService,
    private router: Router,
  ) { }

  async ngOnInit() {
    try {
      this.leagues = await this.leagueService.getAllLeagues();

      const myLeagues = await this.leagueService.getMyLeagues();

      for (const l of myLeagues) {
        this.myLeaguesMap[l.id] = l;
      }

    } catch (e) {
      this.errorMsg = "Error cargando las ligas.";
    }
  }

  isMember(l: any): boolean {
    return l.id in this.myLeaguesMap;
  }

  isAdmin(l: any): boolean {
    return this.myLeaguesMap[l.id]?.my_team?.is_admin === true;
  }


  async requestJoin(leagueId: number) {
    this.loadingReq[leagueId] = true;

    try {
      await this.leagueService.requestJoinLeague(leagueId);
    } finally {
      this.loadingReq[leagueId] = false;
    }
  }

  leaveLeague(leagueId: number) {
    this.leaveModalLeagueId = leagueId;
  }

  closeLeaveModal() {
    this.leaveModalLeagueId = null;
  }

  async confirmLeaveLeague() {
    if (!this.leaveModalLeagueId) return;

    const leagueId = this.leaveModalLeagueId;
    this.loadingReq[leagueId] = true;

    try {
      await this.leagueService.leaveLeague(leagueId);

      delete this.myLeaguesMap[leagueId];

    } catch (err) {
      console.error(err);
    } finally {
      this.loadingReq[leagueId] = false;
      this.leaveModalLeagueId = null; // cerrar modal
    }
  }


  manageLeague(leagueId: number) {
    this.router.navigate(['/admin-league', leagueId]);
  }

  openDetails(leagueId: number) {
    this.router.navigate(['/league-details', leagueId]);
  }
}
