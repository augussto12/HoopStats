import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';
import { League } from '../../../models/interfaces';

@WithLoader()
@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leagues.html',
  styleUrls: ['./leagues.css'],
})
export class Leagues implements OnInit {

  leagues: League[] = [];
  errorMsg = "";
  loadingReq: Record<number, boolean> = {};

  constructor(
    private leagueService: FantasyLeaguesService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    try {
      this.leagues = await this.leagueService.getAllLeagues();
    } catch (e: any) {
      this.errorMsg = "Error cargando las ligas";
    }
  }

  async requestJoin(leagueId: number) {
    this.loadingReq[leagueId] = true;

    try {
      await this.leagueService.requestJoinLeague(leagueId);
      alert("Solicitud enviada correctamente");
    } catch (e: any) {
      alert(e?.error?.error || "Error al enviar solicitud");
    }

    this.loadingReq[leagueId] = false;
  }
}
