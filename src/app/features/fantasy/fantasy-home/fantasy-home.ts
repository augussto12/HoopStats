import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

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
  showNoLeagueModal = false;

  constructor(
    private leaguesService: FantasyLeaguesService,
    private router: Router,
    public injector: Injector
  ) { }

  async ngOnInit() {
    const res = await this.leaguesService.getAdminStatus() as { isAdmin: boolean };
    this.isAdmin = res.isAdmin;
  }

  handleAdminClick() {
    if (!this.isAdmin) {
      this.showNoLeagueModal = true;
      return;
    }
    this.router.navigate(['/admin-league']);
  }

  closeModal() {
    this.showNoLeagueModal = false;
  }
}
