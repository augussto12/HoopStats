import { Component, OnInit } from '@angular/core';
import { FantasyService } from '../../../services/fantasy-service';
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
    // recalcula filteredPlayers con filtros actuales
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
  lockWindowMessage: string = "";

  marketClosesAt: string = "";
  marketOpensAt: string = "";

  // historial agrupado
  groupedHistory: any[] = [];

  error = "";
  success = "";
  renameMessage = "";
  tradeError = "";

  nextUnlockTime: Date | null = null;

  viewMode: 'change' | 'history' | 'scores' = 'change';
  shakeTrade = false;

  constructor(
    private fantasy: FantasyService,
    private api: ApiService,
    private marketLock: MarketLockService,
    private bestPlayersService: BestPlayersService,
  ) { }

  async ngOnInit() {
    await this.loadFantasyTeam();
    await this.loadNbaTeams();
    await this.loadTradeLimits();
    await this.loadAllPlayers();
    await this.loadMarketLock();
    await this.loadGroupedHistory();
    await this.loadScoresByDate();
  }

  async loadFantasyTeam() {
    this.loadingTeam = true;

    const res = await this.fantasy.getMyTeam();

    this.team = res.team;

    this.players = res.players.map((p: any) => ({
      ...p,
      price: Math.round(Number(p.price)),
      total_pts: Number(p.total_pts)
    }));

    this.newName = this.team ? this.team.name : "";
    this.editingName = !this.team;

    if (this.allPlayers.length > 0) {
      this.rebuildAvailablePlayers();
    }

    this.loadingTeam = false;
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

      // Hora Argentina para mostrar
      this.marketClosesAt = res.lockStart ? this.formatTimeARG(res.lockStart) : "";
      this.marketOpensAt = res.lockEnd ? this.formatTimeARG(res.lockEnd) : "";

      if (res.noGamesToday) {
        this.lockReason = "Hoy no hay partidos: el mercado está abierto todo el día.";
        return;
      }

      if (this.isLocked) {
        // está bloqueado ahora
        this.lockReason = this.marketOpensAt
          ? `Mercado cerrado. Vuelve a abrir a las ${this.marketOpensAt} hs.`
          : "Mercado cerrado.";
      } else {
        // está abierto ahora, pero va a cerrar cuando empiece el primer partido
        this.lockReason = this.marketClosesAt
          ? `Mercado abierto. Cierra a las ${this.marketClosesAt} hs.`
          : "Mercado abierto.";
      }

    } catch (err) {
      console.error("Error cargando market lock", err);
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
      // Usamos el nuevo método del service
      const res = await this.bestPlayersService.getTeamScoresByDate(this.team.id, this.selectedScoreDate);
      this.dayPlayersScores = res.players || [];
      this.dayTotalPoints = res.total_day_points || 0;
    } catch (err) {
      console.error("Error cargando puntuaciones", err);
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

    // ✅ sacar los que ya están en mi equipo
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

    // al cerrar
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

    // Loader local para el botón (mantiene el spinner en el botón si tienes uno)
    this.loadingCaptain = playerId;
    this.error = "";
    this.success = "";

    try {
      // La petición se dispara. El Interceptor mostrará el NBA ball loader.
      await this.fantasy.setCaptain(this.team.id, playerId);

      // ACTUALIZACIÓN MANUAL: Esto es lo que hace que funcione sin recargar la página
      this.players = this.players.map(p => ({
        ...p,
        is_captain: p.player_id === playerId
      }));

      this.success = "Nuevo capitán asignado (suma x2)";

    } catch (err: any) {
      this.error = err.error?.error || "Error al asignar capitán";
    } finally {
      // Liberamos el loader del botón
      this.loadingCaptain = null;

      // OPCIONAL: Si ves que el NBA Ball se sigue quedando, fuerza un hide extra:
      // this.loadingService.hide();
    }
  }
}