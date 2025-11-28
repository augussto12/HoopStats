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
  maxTeams: number | null = null;
  description = "";
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

    // VALIDACIONES FRONTEND
    if (!this.leagueName || this.leagueName.trim().length < 3) {
      this.errorMsg = "El nombre debe tener al menos 3 caracteres";
      this.loading = false;
      return;
    }

    if (this.description && this.description.length > 200) {
      this.errorMsg = "La descripción no puede superar los 200 caracteres";
      this.loading = false;
      return;
    }

    if (this.maxTeams !== null) {
      if (isNaN(this.maxTeams) || this.maxTeams < 2 || this.maxTeams > 50) {
        this.errorMsg = "La cantidad máxima de usuarios debe estar entre 2 y 50";
        this.loading = false;
        return;
      }
    }

    try {
      this.privacy = this.isPrivate ? 'private' : 'public';

      const res = await this.leagueService.createLeague(
        this.leagueName.trim(),
        this.privacy,
        this.description || null,
        this.maxTeams
      );

      this.successMsg = "Liga creada correctamente";

      this.leagueName = "";
      this.maxTeams = null;
      this.description = "";
      this.isPrivate = false;

    } catch (e: any) {
      this.errorMsg = e?.error?.error || "Error inesperado";
    }

    this.loading = false;
  }


}
