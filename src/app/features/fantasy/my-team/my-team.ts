import { Component, OnInit, Injector } from '@angular/core';
import { FantasyService } from '../../../services/fantasy-service';
import { NbaApiService } from '../../../services/nba-api';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketLockService } from '../../../services/market-lock.service';
import { Paginator } from '../../../components/paginator/paginator';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator],
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

  // sistema exacto sale/entra
  removalCandidate: any = null;
  additionCandidate: any = null;

  tradesHoy = 0;
  tradesRestantes = 0;
  limiteDiario = 2;

  // Jugadores disponibles
  allPlayers: any[] = [];
  filteredPlayers: any[] = [];

  isLocked: boolean = false;
  lockReason: string = "";


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

  // Paginado
  currentPage = 1;
  pageSize = 16;

  get paginatedPlayers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPlayers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredPlayers.length / this.pageSize);
  }

  historyPage = 1;
  historyPageSize = 5;

  // Loaders
  loadingTeam = true;
  loadingCreate = false;
  loadingAdd = false;
  loadingRemove: number | null = null;
  loadingRename = false;
  loadingTrades = false;

  attemptedApply = false;
  nbaTeams: any[] = [];
  lockWindowMessage: string = "";


  // historial agrupado
  groupedHistory: any[] = [];

  error = "";
  success = "";
  renameMessage = "";
  tradeError = "";

  nextUnlockTime: Date | null = null;



  viewMode: 'change' | 'history' = 'change';
  shakeTrade = false;

  constructor(
    private fantasy: FantasyService,
    private api: ApiService,
    private nba: NbaApiService,
    private marketLock: MarketLockService
  ) { }

  async ngOnInit() {
    await this.loadFantasyTeam();
    await this.loadNbaTeams();
    await this.loadTradeLimits();
    await this.loadAllPlayers();
    await this.loadMarketLock();
    await this.loadGroupedHistory();
  }

  async loadFantasyTeam() {
    this.loadingTeam = true;

    const res = await this.fantasy.getMyTeam();

    this.team = res.team;

    // Convertir price a entero y total_pts a número
    this.players = res.players.map((p: any) => ({
      ...p,
      price: Math.round(Number(p.price)),
      total_pts: Number(p.total_pts)
    }));


    this.newName = this.team ? this.team.name : "";
    this.editingName = !this.team;

    this.loadingTeam = false;
  }


  async loadTradeLimits() {
    try {
      const res = await this.fantasy.getTradesToday();
      if (!res) {
        this.tradesHoy = 0;
        this.tradesRestantes = this.limiteDiario;
        return;
      }

      this.tradesHoy = res.tradesHoy ?? 0;
      this.tradesRestantes = res.tradesRestantes ?? this.limiteDiario;

    } catch {
      this.tradesHoy = 0;
      this.tradesRestantes = this.limiteDiario;
    }
  }

  async loadGroupedHistory() {
    if (!this.team) return;

    try {
      const res = await this.fantasy.getGroupedTransactionsByTeam(this.team.id);
      this.groupedHistory = Array.isArray(res) ? res : [];
    } catch {
      this.groupedHistory = [];
    }
  }


  async loadNbaTeams() {
    this.nbaTeams = await this.api.get('/teams');
  }

  async loadAllPlayers() {
    this.allPlayers = await this.api.get('/players');
    this.filteredPlayers = this.allPlayers;
  }

  async loadMarketLock() {
    try {
      const res: any = await this.marketLock.getMarketLock();
      console.log("market lock:", res);

      this.isLocked = res.isLocked;   // ← LO IMPORTANTE

      if (this.isLocked) {
        this.lockReason = "El mercado está bloqueado actualmente.";
      } else {
        this.lockReason = "";
      }

    } catch (err) {
      console.error("Error cargando market lock", err);
      this.isLocked = false;
      this.lockReason = "";
    }
  }






  get necesitaIniciales(): boolean {
    return this.players.length < 5;
  }


  async saveName() {
    const name = this.newName.trim();

    if (name.length < 3) {
      this.error = "El nombre debe tener al menos 3 caracteres";
      return;
    }

    this.loadingCreate = true;
    this.error = "";
    this.success = "";
    this.renameMessage = "";

    try {
      if (!this.team) {

        await this.fantasy.createTeam(name);
        this.loadingCreate = false;
        await this.loadFantasyTeam();

      } else {
        this.loadingRename = true;
        const res: any = await this.fantasy.updateName(name);
        this.team = res.team;
        this.renameMessage = "Nombre actualizado";
      }

      this.editingName = false;

    } catch (err: any) {
      this.error = err.error?.error || "Error inesperado";
    } finally {
      this.loadingCreate = false;
      this.loadingRename = false;
    }
  }



  markForRemoval(player: any) {
    this.removalCandidate = player;
  }

  markForAddition(player: any) {
    this.additionCandidate = player;
  }

  async applyTrades() {
    this.tradeError = "";
    this.attemptedApply = true;
    this.error = "";
    this.success = "";

    // CASO A: NECESITA COMPLETAR LOS 5
    if (this.necesitaIniciales) {

      if (!this.additionCandidate) {
        this.shakeTrade = true;
        setTimeout(() => this.shakeTrade = false, 600);
        return;
      }

      this.loadingTrades = true;

      try {
        await this.fantasy.addPlayer(this.additionCandidate.id);

        this.success = "Jugador agregado correctamente";

        await this.loadFantasyTeam();
        await this.loadGroupedHistory();

        this.additionCandidate = null;
        this.showAddForm = false;

      } catch (err: any) {
        this.error = err.error?.error || "Error al agregar jugador";
      } finally {
        this.loadingTrades = false;
      }

      return;
    }

    // CASO 2: TRADE INCOMPLETO
    if (!this.removalCandidate || !this.additionCandidate) {
      this.shakeTrade = true;
      setTimeout(() => (this.shakeTrade = false), 600);
      return;
    }

    // CASO 3: SIN PRESUPUESTO
    if (this.isBudgetInvalid) {
      this.shakeTrade = true;
      this.tradeError = "No tenés presupuesto suficiente.";
      setTimeout(() => (this.shakeTrade = false), 600);
      return;
    }

    // CASO 4: TRADE COMPLETO
    this.loadingTrades = true;

    try {
      await this.fantasy.applyTrades(
        [this.additionCandidate.id],
        [this.removalCandidate.player_id]
      );

      this.success = "Cambio aplicado correctamente";

      await this.loadFantasyTeam();
      await this.loadTradeLimits();
      await this.loadGroupedHistory();

      this.removalCandidate = null;
      this.additionCandidate = null;

    } catch (err: any) {
      this.error = err.error?.error || "Error al aplicar cambio";
    } finally {
      this.loadingTrades = false;
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
      list = list.filter(
        p => Number(p.price) >= this.selectedRange.min &&
          Number(p.price) <= this.selectedRange.max
      );
    }

    if (this.exactPrice !== null) {
      const num = Number(this.exactPrice);
      if (!isNaN(num)) {
        list = list.filter(p => Number(p.price) === num);
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

    this.attemptedApply = false;

    if (!this.showAddForm) {
      this.resetFilters();
      this.additionCandidate = null;
      this.removalCandidate = null;
    }
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  get historyTotalPages() {
    return Math.ceil(this.groupedHistory.length / this.historyPageSize);
  }

  get paginatedHistory() {
    const start = (this.historyPage - 1) * this.historyPageSize;
    return this.groupedHistory.slice(start, start + this.historyPageSize);
  }


  get budgetPreview(): number | null {
    if (!this.team) return null;

    const current = Number(this.team.budget);

    // Si agrega solo (no hay jugador que sale)
    if (this.additionCandidate && !this.removalCandidate) {
      return current - Number(this.additionCandidate.price);
    }

    // Si es un trade (sale + entra)
    if (this.additionCandidate && this.removalCandidate) {
      return current
        + Number(this.removalCandidate.price)
        - Number(this.additionCandidate.price);
    }

    return null;
  }

  get isBudgetInvalid(): boolean {
    return this.budgetPreview !== null && this.budgetPreview < 0;
  }

  switchToChange() {
    this.viewMode = 'change';
    this.error = "";
    this.success = "";
  }

  switchToHistory() {
    this.viewMode = 'history';
    this.error = "";
    this.success = "";
  }





}
