import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-my-leagues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-leagues.html',
  styleUrls: ['./my-leagues.css']
})
export class MyLeagues {

  leagues: any[] = [];
  currentIndex = 0;
  currentLeague: any = null;

  constructor(
    private leaguesService: FantasyLeaguesService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    await this.loadLeagues();
  }

  async loadLeagues() {
    try {
      this.leagues = await this.leaguesService.getMyLeagues();
      this.currentLeague = this.leagues[this.currentIndex];
    } catch (err) {
      console.error("Error cargando ligas:", err);
    }
  }

  nextLeague() {
    if (this.currentIndex < this.leagues.length - 1) {
      this.currentIndex++;
      this.animateChange();
    }
  }

  prevLeague() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.animateChange();
    }
  }

  animateChange() {
    this.currentLeague = null;
    setTimeout(() => {
      this.currentLeague = this.leagues[this.currentIndex];
    }, 150);
  }

  get myRank() {
    if (!this.currentLeague) return '-';
    return this.currentLeague.teams.findIndex((t: any) => t.team_id === this.currentLeague.me.team_id) + 1;
  }

}
