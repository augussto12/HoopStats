import { Component, OnInit } from '@angular/core';
import { FantasyService } from '../../../services/fantasy/fantasy-service';
import { LocalApiService } from '../../../services/local-api';
import { FantasyTeam } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(
    private fantasyService: FantasyService,
    private api: LocalApiService
  ) { }

  async ngOnInit() {
    this.fantasyTeam = await this.fantasyService.getFantasyTeam();

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
    const added = await this.fantasyService.addPlayer({
      id: player.idJugador,
      name: player.nombre,
      price: player.precio
    });

    if (!added) {
      this.error = "No se pudo agregar el jugador";
      return;
    }

    this.success = "Jugador agregado correctamente";
    this.fantasyTeam = added;

    // cerrar form y reset
    this.showAddForm = false;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.selectedTeamId = null;
      this.selectedPlayerId = null;
      this.players = [];
    }
  }


}
