import { Component, OnInit, Injector } from '@angular/core';
import { FantasyService } from '../../../services/fantasy-service';
import { NbaApiService } from '../../../services/nba-api';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithLoader } from '../../../decorators/with-loader.decorator';

@WithLoader()
@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-team.html',
  styleUrls: ['./my-team.css'],
})
export class MyTeam implements OnInit {

  team: any = null;
  players: any[] = []; // jugadores del team

  // UI
  editingName = false;
  newName = "";
  showAddForm = false;

  // Jugadores disponibles
  allPlayers: any[] = [];
  filteredPlayers: any[] = [];

  // Filtros
  priceRanges = [
    { label: "Cualquiera", min: 0, max: 9999 },
    { label: "100 - 200", min: 100, max: 200 },
    { label: "200 - 300", min: 200, max: 300 },
    { label: "300 - 400", min: 300, max: 400 }
  ];
  selectedRange: any = null;
  selectedTeam: number | null = null;
  loadingTeam = true;
  loadingCreate = false;
  loadingAdd = false;
  loadingRemove: number | null = null;
  loadingRename = false;

  nbaTeams: any[] = [];
  liveGames: any[] = [];

  // mensajes
  error = "";
  success = "";

  constructor(
    public injector: Injector,
    private fantasy: FantasyService,
    private api: ApiService,
    private nba: NbaApiService
  ) { }

  async ngOnInit() {
    await this.loadFantasyTeam();
    await this.loadLiveGames();
    await this.loadNbaTeams();
    await this.loadAllPlayers();
  }

  async loadFantasyTeam() {
    this.loadingTeam = true;

    const res = await this.fantasy.getMyTeam();
    this.team = res.team;
    this.players = res.players;

    if (!this.team) {
      this.editingName = true;
      this.newName = "";
    } else {
      this.newName = this.team.name;
    }

    this.loadingTeam = false;
  }


  async loadLiveGames() {
    this.liveGames = await this.nba.getLiveGames();
  }

  async loadNbaTeams() {
    this.nbaTeams = await this.nba.getTeams();
  }

  async loadAllPlayers() {
    this.allPlayers = await this.api.get('/players');
    this.filteredPlayers = this.allPlayers;
  }


  async saveName() {
    const name = this.newName.trim();

    if (name.length < 3) {
      this.error = "El nombre debe tener al menos 3 caracteres";
      this.success = "";
      return;
    }

    this.error = "";
    this.success = "";

    try {
      if (!this.team) {
        // Crear equipo
        this.loadingCreate = true;
        await this.fantasy.createTeam(name);

        this.success = "Equipo creado";
        await this.loadFantasyTeam();
      } else {
        // Renombrar equipo
        this.loadingRename = true;
        const res: any = await this.fantasy.updateName(name);

        this.team = res.team;
        this.success = "Nombre actualizado";
      }

      this.editingName = false;

    } catch (err: any) {
      this.error = err.error?.error || "Error inesperado";
    } finally {
      this.loadingCreate = false;
      this.loadingRename = false;
    }
  }




  async addPlayer(playerId: number) {
    this.loadingAdd = true;
    this.error = "";
    this.success = "";

    try {
      await this.fantasy.addPlayer(playerId);

      this.success = "Jugador agregado";
      await this.loadFantasyTeam();
      this.showAddForm = false;

    } catch (err: any) {
      this.error = err.error?.error || "Error inesperado";
    } finally {
      this.loadingAdd = false;
    }
  }



  async removePlayer(playerId: number) {
    this.loadingRemove = playerId;
    this.error = "";
    this.success = "";

    try {
      await this.fantasy.removePlayer(playerId);
      this.success = "Jugador eliminado";
      await this.loadFantasyTeam();
    } catch (err: any) {
      this.error = err.error?.error || "No se pudo eliminar";
    } finally {
      this.loadingRemove = null;
    }
  }



  filterPlayers() {
    let list = [...this.allPlayers];

    if (this.selectedTeam) {
      list = list.filter(p => p.team_id === Number(this.selectedTeam));
    }

    if (this.selectedRange) {
      list = list.filter(p =>
        p.price >= this.selectedRange.min &&
        p.price <= this.selectedRange.max
      );
    }

    this.filteredPlayers = list;
  }

  resetFilters() {
    this.selectedRange = null;
    this.selectedTeam = null;
    this.filteredPlayers = this.allPlayers;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.resetFilters();
    }
  }
}
