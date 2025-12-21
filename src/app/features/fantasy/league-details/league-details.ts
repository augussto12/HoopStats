import { ActivatedRoute } from "@angular/router";
import { FantasyLeaguesService } from "../../../services/fantasy-leagues.service";
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  LeagueTrade,
  LeagueMarketStat,
  LeagueTeam,
  LeagueInfo,
  LeagueDetailsResponse
} from "../../../models/interfaces";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './league-details.html',
  styleUrls: ['./league-details.css']
})
export class LeagueDetails implements OnInit {

  league!: LeagueInfo;
  teams: LeagueTeam[] = [];
  trades: LeagueTrade[] = [];
  marketStats: LeagueMarketStat[] = [];

  activeTab: 'ranking' | 'trades' | 'market' = 'ranking';

  currentUsername: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private leagueService: FantasyLeaguesService,
    private auth: AuthService
  ) { }

  async ngOnInit() {

    this.currentUsername = this.auth.getUser()?.username;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const data = await this.leagueService.getLeagueDetails(id) as LeagueDetailsResponse;

    this.league = data.league;
    this.teams = data.teams;
  }

  async switchTab(tab: 'ranking' | 'trades' | 'market') {
    this.activeTab = tab;

    const leagueId = this.league.id;

    if (tab === 'trades' && this.trades.length === 0) {
      this.trades = await this.leagueService.getLeagueTrades(leagueId) as LeagueTrade[];
    }

    if (tab === 'market' && this.marketStats.length === 0) {
      this.marketStats = await this.leagueService.getLeagueMarket(leagueId) as LeagueMarketStat[];
    }
  }
}
