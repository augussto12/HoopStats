import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { Injector } from '@angular/core';
import { WithLoader } from '../../../decorators/with-loader.decorator';
import { CommonModule } from '@angular/common';

@WithLoader()
@Component({
  selector: 'app-league-details',
  imports: [CommonModule],
  templateUrl: './league-details.html',
  styleUrls: ['./league-details.css','../my-leagues/my-leagues.css']
})
export class LeagueDetails implements OnInit {

  league: any = null;
  teams: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private leagueService: FantasyLeaguesService,
    public inject: Injector
  ) { }

  async ngOnInit() {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    const data = await this.leagueService.getLeagueDetails(id);

    this.league = data.league;
    this.teams = data.teams;

    this.loading = false;
  }

}
