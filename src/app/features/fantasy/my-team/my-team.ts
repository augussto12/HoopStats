import { Component, OnInit } from '@angular/core';
import { FantasyService } from '../../../services/fantasy-service'; // si tu path real es fantasy.service, cambialo
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketLockService } from '../../../services/market-lock.service';
import { Paginator } from '../../../components/paginator/paginator';
import { BestPlayersService } from '../../../services/best-players.service';

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

  loadingCaptain: number | null = null;

  tradesHoy = 0;
  tradesRestantes = 0;
  limiteDiario = 2;

  // Jugadores disponibles
  allPlayers: any[] = [];
  filteredPlayers: any[] = [];

  isLocked: boolean = false;
  lockReason: string = "";

  selectedScoreDate: string = new Date().toISOString().split('T')[0];
  dayPlayersScores: any[] = [];
  dayTotalPoints: number = 0;
  loadingScores: boolean = false;

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

  private get myPlayerIds(): Set<number> {
    return new Set(this.players.map(p => Number(p.player_id)));
  }

  private rebuildAvailablePlayers() {
    this.filterPlayers();
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

  marketClosesAt: string = "";
  marketOpensAt: string = "";

  // historial agrupado
  groupedHistory: any[] = [];

  error = "";
  success = "";
  renameMessage = "";
  tradeError = "";

  viewMode: 'change' | 'history' | 'scores' = 'change';
  shakeTrade = false;

  constructor(
    private fantasy: FantasyService,
    private api: ApiService,
    private marketLock: MarketLockService,
    private bestPlayersService: BestPlayersService,
  ) { }

  async ngOnInit() {
    // 1) Team primero (lo necesitan history y scores)
    await this.loadFantasyTeam();

    // 2) Lo demás en paralelo
    await Promise.allSettled([
      this.loadNbaTeams(),
      this.loadTradeLimits(),
      this.loadAllPlayers(),
      this.loadMarketLock(),
      this.loadGroupedHistory(),
      this.loadScoresByDate(),
    ]);
  }

  async loadFantasyTeam() {
    this.loadingTeam = true;

    try {
      const res = await this.fantasy.getMyTeam();
      this.team = res.team;

      this.players = (res.players ?? []).map((p: any) => ({
        ...p,
        price: Math.round(Number(p.price)),
        total_pts: Number(p.total_pts)
      }));

      this.newName = this.team ? this.team.name : "";
      this.editingName = !this.team;

      if (this.allPlayers.length > 0) {
        this.rebuildAvailablePlayers();
      }
    } finally {
      this.loadingTeam = false;
    }
  }

  private formatTimeARG(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
    this.rebuildAvailablePlayers();
  }

  async loadMarketLock() {
    try {
      const res: any = await this.marketLock.getMarketLock();

      this.isLocked = !!res.isLocked;

      this.marketClosesAt = res.lockStart ? this.formatTimeARG(res.lockStart) : "";
      this.marketOpensAt = res.lockEnd ? this.formatTimeARG(res.lockEnd) : "";

      if (res.noGamesToday) {
        this.lockReason = "Hoy no hay partidos: el mercado está abierto todo el día.";
        return;
      }

      if (this.isLocked) {
        this.lockReason = this.marketOpensAt
          ? `Mercado cerrado. Vuelve a abrir a las ${this.marketOpensAt} hs.`
          : "Mercado cerrado.";
      } else {
        this.lockReason = this.marketClosesAt
          ? `Mercado abierto. Cierra a las ${this.marketClosesAt} hs.`
          : "Mercado abierto.";
      }
    } catch {
      this.isLocked = false;
      this.lockReason = "";
      this.marketClosesAt = "";
      this.marketOpensAt = "";
    }
  }

  async loadScoresByDate() {
    if (!this.team || !this.selectedScoreDate) return;

    this.loadingScores = true;
    try {
      const res = await this.bestPlayersService.getTeamScoresByDate(this.team.id, this.selectedScoreDate);
      this.dayPlayersScores = res.players || [];
      this.dayTotalPoints = res.total_day_points || 0;
    } catch {
      this.dayPlayersScores = [];
      this.dayTotalPoints = 0;
    } finally {
      this.loadingScores = false;
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

    // CASO A: completar iniciales (solo add)
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
        await this.loadTradeLimits();

        this.additionCandidate = null;
        this.showAddForm = false;
      } catch (err: any) {
        this.error = err.error?.error || "Error al agregar jugador";
      } finally {
        this.loadingTrades = false;
      }

      return;
    }

    // CASO 2: trade incompleto
    if (!this.removalCandidate || !this.additionCandidate) {
      this.shakeTrade = true;
      setTimeout(() => (this.shakeTrade = false), 600);
      return;
    }

    // CASO 3: sin presupuesto
    if (this.isBudgetInvalid) {
      this.shakeTrade = true;
      this.tradeError = "No tenés presupuesto suficiente.";
      setTimeout(() => (this.shakeTrade = false), 600);
      return;
    }

    // CASO 4: trade completo
    this.loadingTrades = true;

    try {
      await this.fantasy.applyTrades(
        [this.additionCandidate.id],
        [this.removalCandidate.player_id]
      );

      this.success = "Cambio aplicado correctamente";

      // ✅ respuesta instantánea UI
      this.applyTradeLocally(this.additionCandidate, this.removalCandidate);

      // ✅ refrescos livianos para consistencia
      await Promise.allSettled([
        this.loadGroupedHistory(),
        this.loadTradeLimits(),
      ]);

      this.removalCandidate = null;
      this.additionCandidate = null;

    } catch (err: any) {
      this.error = err.error?.error || "Error al aplicar cambio";
    } finally {
      this.loadingTrades = false;
    }
  }

  private applyTradeLocally(addPlayer: any, dropPlayer: any) {
    if (!this.team || !addPlayer || !dropPlayer) return;

    const dropId = Number(dropPlayer.player_id);
    const addId = Number(addPlayer.id);

    const budgetNow = Number(this.team.budget);
    const dropPrice = Number(dropPlayer.price ?? 0);
    const addPrice = Number(addPlayer.price ?? 0);

    this.team = {
      ...this.team,
      budget: budgetNow + dropPrice - addPrice,
      trades_remaining: Math.max(0, Number(this.team.trades_remaining ?? 0) - 1),
    };

    const withoutDropped = this.players.filter(p => Number(p.player_id) !== dropId);

    const newRow = {
      player_id: addId,
      full_name: addPlayer.full_name ?? addPlayer.name ?? "Nuevo jugador",
      price: Math.round(addPrice),
      total_pts: 0,
      is_captain: false,
      team_id: addPlayer.team_id ?? null,
    };

    this.players = [...withoutDropped, newRow];

    this.removalCandidate = null;
    this.additionCandidate = null;
    this.showAddForm = false;

    if (this.allPlayers.length > 0) {
      this.rebuildAvailablePlayers();
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

    const owned = this.myPlayerIds;
    list = list.filter(p => !owned.has(Number(p.id)));

    if (this.selectedTeam) {
      list = list.filter(p => p.team_id === Number(this.selectedTeam));
    }

    if (this.selectedRange) {
      list = list.filter(p =>
        Number(p.price) >= this.selectedRange.min &&
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

    this.rebuildAvailablePlayers();
    this.currentPage = 1;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.attemptedApply = false;

    if (this.showAddForm) {
      this.rebuildAvailablePlayers();
      return;
    }

    this.resetFilters();
    this.additionCandidate = null;
    this.removalCandidate = null;
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

    if (this.additionCandidate && !this.removalCandidate) {
      return current - Number(this.additionCandidate.price);
    }

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

  switchToScores() {
    this.viewMode = 'scores';
    this.error = "";
    this.success = "";
    if (this.dayPlayersScores.length === 0) {
      this.loadScoresByDate();
    }
  }

  async setCaptain(playerId: number) {
    if (this.isLocked || !this.team) return;

    this.loadingCaptain = playerId;
    this.error = "";
    this.success = "";

    try {
      await this.fantasy.setCaptain(this.team.id, playerId);

      this.players = this.players.map(p => ({
        ...p,
        is_captain: p.player_id === playerId
      }));

      this.success = "Nuevo capitán asignado (suma x2)";
    } catch (err: any) {
      this.error = err.error?.error || "Error al asignar capitán";
    } finally {
      this.loadingCaptain = null;
    }
  }
}
