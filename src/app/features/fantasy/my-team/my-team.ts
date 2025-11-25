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
  players: any[] = [];

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
  exactPrice: number | null = null;


  // PAGINADO
  currentPage = 1;
  pageSize = 12; // jugadores por página

  get paginatedPlayers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPlayers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredPlayers.length / this.pageSize);
  }

  // Loaders
  loadingTeam = true;
  loadingCreate = false;
  loadingAdd = false;
  loadingRemove: number | null = null;
  loadingRename = false;

  nbaTeams: any[] = [];
  liveGames: any[] = [];

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

    this.newName = this.team ? this.team.name : "";
    this.editingName = !this.team;

    this.loadingTeam = false;
  }

  async loadLiveGames() {
    this.liveGames = await this.nba.getLiveGames();
  }

  async loadNbaTeams() {
    this.nbaTeams = await this.api.get('/teams');
  }

  async loadAllPlayers() {
    this.allPlayers = await this.api.get('/players');
    this.filteredPlayers = this.allPlayers;
  }

  async saveName() {
    const name = this.newName.trim();

    if (name.length < 3) {
      this.error = "El nombre debe tener al menos 3 caracteres";
      return;
    }

    this.error = "";
    this.success = "";

    try {
      if (!this.team) {
        this.loadingCreate = true;
        await this.fantasy.createTeam(name);
        this.success = "Equipo creado";
        await this.loadFantasyTeam();
      } else {
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

    // FILTRO POR EQUIPO
    if (this.selectedTeam) {
      list = list.filter(p => p.team_id === Number(this.selectedTeam));
    }

    // FILTRO POR RANGO
    if (this.selectedRange) {
      list = list.filter(
        p => Number(p.price) >= this.selectedRange.min &&
          Number(p.price) <= this.selectedRange.max
      );
    }

    // 🔥 FILTRO EXACTO POR PRECIO — FIX REAL
    if (this.exactPrice !== null && this.exactPrice !== undefined) {
      const priceNum = Number(this.exactPrice);

      if (!isNaN(priceNum)) {
        list = list.filter(p => Number(p.price) === priceNum);
      }
    }

    this.filteredPlayers = list;
    this.currentPage = 1;
  }


  resetFilters() {
    this.selectedRange = null;
    this.selectedTeam = null;
    this.exactPrice = null;
    this.filteredPlayers = this.allPlayers;
    this.currentPage = 1;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.resetFilters();
    }
  }
}
