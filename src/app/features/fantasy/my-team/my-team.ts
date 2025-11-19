import { Component, OnInit } from '@angular/core';
import { FantasyService } from '../../../services/fantasy/fantasy-service';
import { LocalApiService } from '../../../services/local-api';
import { FantasyTeam } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbaApiService } from '../../../services/nba-api';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-team.html',
  styleUrls: ['./my-team.css'],
})
export class MyTeam implements OnInit {

  fantasyTeam: FantasyTeam | null = null;

  editingName = false;
  newName = '';

  teams: any[] = [];
  players: any[] = [];

  selectedTeamId: number | null = null;
  selectedPlayerId: number | null = null;

  showAddForm = false;

  error = '';
  success = '';

  priceRanges = [
    { label: "Sin filtro", min: 50, max: 450 },
    { label: "100 - 150", min: 100, max: 150 },
    { label: "150 - 200", min: 150, max: 200 },
    { label: "200 - 250", min: 200, max: 250 },
    { label: "250 - 300", min: 250, max: 300 },
    { label: "300 - 350", min: 300, max: 350 },
    { label: "350 - 400", min: 350, max: 400 },
  ];

  selectedRange: any = null;
  playersFiltered: any[] = [];

  liveGames: any[] = [];

  constructor(
    private fantasyService: FantasyService,
    private api: LocalApiService,
    private nbaApi: NbaApiService
  ) { }

  async ngOnInit() {
    this.fantasyTeam = await this.fantasyService.getFantasyTeam();
    this.liveGames = await this.nbaApi.getLiveGames();

    // JSON de jugadores con precios
    this.teams = await this.api.getAll("pricePlayers");

    if (!this.fantasyTeam) {
      this.editingName = true;
    } else {
      this.newName = this.fantasyTeam.name;
    }
  }

  async saveName() {
    if (this.newName.trim().length < 3) {
      this.error = "El nombre debe tener al menos 3 caracteres";
      return;
    }

    await this.fantasyService.createFantasyTeam(this.newName);
    this.fantasyTeam = await this.fantasyService.getFantasyTeam();

    this.success = "Nombre guardado";
    this.error = "";
    this.editingName = false;
  }

  async removePlayer(idPlayer: number) {
    const updated = await this.fantasyService.removePlayer(idPlayer);
    if (updated) this.fantasyTeam = updated;
  }

  // Cuando cambia el equipo
  onTeamChange() {
    const team = this.teams.find(t => t.idTeam === Number(this.selectedTeamId));

    // Previene errores si no encuentra el equipo o no tiene players
    this.players = team?.players ?? [];
    this.selectedPlayerId = null;
  }

  // Agregar jugador al equipo fantasy
  async addSelectedPlayer(player: any) {
    try {
      const team = await this.fantasyService.addPlayer({
        id: player.idJugador,
        name: player.nombre,
        price: player.precio
      });

      // Si no explota, funciona
      this.success = "Jugador agregado correctamente";
      this.error = "";
      this.fantasyTeam = team;

      this.resetFilters();
      this.showAddForm = false;

    } catch (err: any) {
      this.error = err.message || "Error inesperado";
      this.success = "";
    }
  }



  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.resetFilters();
    }
  }


  filterPlayers() {
    let players = [];

    // 1) Si eligió un equipo → usar SOLO esos jugadores
    if (this.selectedTeamId) {
      const team = this.teams.find(t => t.idTeam === Number(this.selectedTeamId));
      players = team ? team.players : [];
    }
    else {
      // Si NO hay equipo → usar todos los jugadores
      players = this.teams.reduce((acc, t) => acc.concat(t.players), []);
    }

    // 2) Si eligió un rango → filtrar por precio
    if (this.selectedRange) {
      const { min, max } = this.selectedRange;

      players = players.filter(
        (p: any) => p.precio >= min && p.precio <= max
      );
    }

    // Resultado final
    this.playersFiltered = players;
  }

  resetFilters() {
    this.selectedTeamId = null;
    this.selectedRange = null;
    this.selectedPlayerId = null;

    this.players = [];
    this.playersFiltered = [];
  }

}
