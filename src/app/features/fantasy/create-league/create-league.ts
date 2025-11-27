import { Component, Injector, OnInit } from "@angular/core";
import { FantasyLeaguesService } from "../../../services/fantasy-leagues.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WithLoader } from "../../../decorators/with-loader.decorator";

@WithLoader()
@Component({
  selector: "app-create-league",
  standalone: true,
  templateUrl: "./create-league.html",
  styleUrls: ["./create-league.css"],
  imports: [CommonModule, FormsModule]
})
export class CreateLeagueComponent implements OnInit {

  leagueName = "";
  maxUsers: number | null = null;
  privacy: 'public' | 'private' = 'public';
  isPrivate = false;

  loading = false;
  successMsg = "";
  errorMsg = "";

  constructor(private leagueService: FantasyLeaguesService, public inject: Injector) { }

  ngOnInit() { }

  async submitLeague() {
    this.loading = true;
    this.successMsg = "";
    this.errorMsg = "";

    try {
      this.privacy = this.isPrivate ? 'private' : 'public';

      const res = await this.leagueService.createLeague(
        this.leagueName,
        this.privacy
      );

      this.successMsg = "Liga creada correctamente";

      this.leagueName = "";
      this.maxUsers = null;
      this.isPrivate = false;

    } catch (e: any) {
      this.errorMsg =
        e?.error?.error ||
        'Error inesperado';
    }

    this.loading = false;
  }
}
