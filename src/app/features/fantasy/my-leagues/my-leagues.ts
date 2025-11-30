import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-leagues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-leagues.html',
  styleUrls: ['./my-leagues.css']
})
export class MyLeagues {

  loading = false;
  leagues: any[] = [];

  constructor(
    private leaguesService: FantasyLeaguesService,
    private router: Router,
  ) { }

  async ngOnInit() {
    await this.loadLeagues();
  }

  async loadLeagues() {
    this.loading = true;
    try {
      this.leagues = await this.leaguesService.getMyLeagues();
    } catch (err) {
      console.error("Error cargando ligas:", err);
    }
    this.loading = false;
  }

  openLeague(lg: any) {
    this.router.navigate(['/league-details', lg.id]);
  }


}
