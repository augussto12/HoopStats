import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';
import { Router } from '@angular/router';

@WithLoader()
@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leagues.html',
  styleUrls: ['./leagues.css'],
})
export class Leagues implements OnInit {

  leagues: any[] = [];             // Todas las ligas públicas/privadas
  myLeagueIds: number[] = [];      // Ligas donde soy miembro
  errorMsg = "";
  loadingReq: Record<number, boolean> = {};
  currentUser: any = null;

  constructor(
    private leagueService: FantasyLeaguesService,
    private router: Router,
    public injector: Injector
  ) { }

  async ngOnInit() {

    // Cargar usuario
    const stored = localStorage.getItem("user");
    this.currentUser = stored ? JSON.parse(stored) : null;

    try {
      // Todas las ligas del sistema
      this.leagues = await this.leagueService.getAllLeagues();

      // Mis ligas (estructura: { league: {...}, me:{...}, teams:[], recent_trades:[] })
      const myLeagues = await this.leagueService.getMyLeagues();

      // Guardar IDs de ligas propias
      this.myLeagueIds = myLeagues.map(l => l.league.id);

    } catch (e) {
      this.errorMsg = "Error cargando las ligas";
    }
  }

  // ¿Soy el creador/admin?
  isAdmin(l: any): boolean {
    return l.creator_username === this.currentUser?.username;
  }

  // ¿Soy miembro?
  isMember(l: any): boolean {
    return this.myLeagueIds.includes(l.id);
  }

  // Solicitar unirse
  async requestJoin(leagueId: number) {
    this.loadingReq[leagueId] = true;

    try {
      await this.leagueService.requestJoinLeague(leagueId);

      // 👉 actualizar UI sin alert
      console.log("Solicitud enviada");
    } catch (e: any) {
      console.error(e?.error?.error || "Error al enviar solicitud");
    }

    this.loadingReq[leagueId] = false;
  }

  async leaveLeague(leagueId: number) {
    if (!confirm("¿Seguro que quieres abandonar la liga?")) return;

    this.loadingReq[leagueId] = true;

    try {
      await this.leagueService.leaveLeague(leagueId);

      // 👉 actualizar UI sin alert
      this.myLeagueIds = this.myLeagueIds.filter(id => id !== leagueId);
    } catch (e: any) {
      console.error(e?.error?.error || "Error al abandonar la liga");
    }

    this.loadingReq[leagueId] = false;
  }


  // Navegar al panel admin
  manageLeague(leagueId: number) {
    this.router.navigate(['/league-admin', leagueId]);
  }

  // Ir a detalles
  openDetails(leagueId: number) {
    this.router.navigate(['/league-details', leagueId]);
  }

  showToast(msg: string) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

}
