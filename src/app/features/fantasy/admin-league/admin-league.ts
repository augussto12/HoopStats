import { Component, Injector, OnInit } from '@angular/core';
import { User, MyLeague, MyCreatedLeague } from '../../../models/interfaces';
import { UserService } from '../../../services/user.service';
import { AdminLeagueService } from '../../../services/admin-league.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';

export type MemberUser = User & {
  role: 'admin' | 'member';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  invite_id?: number;
  origin?: 'team' | 'invite';
  _new?: boolean;
};

@WithLoader()
@Component({
  selector: 'app-admin-league',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-league.html',
  styleUrls: ['./admin-league.css', '../my-team/my-team.css']
})
export class AdminLeagueComponent implements OnInit {

  /** TODAS las ligas que creo el usuario */
  adminLeagues: MyCreatedLeague[] = [];

  /** Liga seleccionada por índice */
  selectedLeagueIndex = 0;

  /** Datos derivados */
  league: any = null;
  members: MemberUser[] = [];
  allUsers: User[] = [];

  selectedUser: User | null = null;
  modalUser: MemberUser | null = null;
  removeMode: 'delete' | 'inactivate' = 'delete';

  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  isPrivate = false;

  constructor(
    private adminService: AdminLeagueService,
    private leagueService: FantasyLeaguesService,
    private userService: UserService,
    public injector: Injector
  ) { }

  async ngOnInit() {
    this.loading = true;

    try {
      // 1️⃣ TRAER TODAS LAS LIGAS CREADAS POR EL USUARIO (CON TODO ADENTRO)
      this.adminLeagues = await this.leagueService.getMyCreatedLeagues();

      if (this.adminLeagues.length === 0) {
        this.errorMsg = "No creaste ninguna liga.";
        return;
      }

      // 2️⃣ Cargar la primer liga
      this.loadLeagueFromMemory(0);

      // 3️⃣ Usuarios para invitar
      this.allUsers = await this.userService.getAllUsers();

    } catch (e) {
      console.error(e);
      this.errorMsg = "Error al cargar tus ligas.";
    }

    this.loading = false;
  }

  /** Cuando cambia el selector */
  onLeagueChange() {
    this.loadLeagueFromMemory(this.selectedLeagueIndex);
  }

  /** Carga la liga SIN llamar al backend */
  loadLeagueFromMemory(index: number) {
    const entry = this.adminLeagues[index];

    this.league = entry.league;

    this.members = entry.members.map((m): MemberUser => ({
      id: m.id,
      username: m.username,
      email: m.email,
      role: m.role ?? 'member',
      status: this.normalizeStatus(m.status),
      invite_id: m.invite_id,
      origin: m.origin,
      _new: false
    }));

    this.isPrivate = this.league.privacy === 'private';
  }


  /** Normalización de estados para el front */
  normalizeStatus(raw: string): MemberUser["status"] {
    switch (raw) {
      case 'active': return 'active';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'inactive';
    }
  }

  isAlreadyMember(u: User): boolean {
    return this.members.some(m => m.id === u.id);
  }

  addUser() {
    if (this.selectedUser && !this.isAlreadyMember(this.selectedUser)) {
      this.members.push({
        ...this.selectedUser,
        role: 'member',
        status: 'pending',
        origin: 'invite',
        _new: true
      });
    }
    this.selectedUser = null;
  }

  openRemoveModal(u: MemberUser, mode: 'delete' | 'inactivate') {
    this.modalUser = u;
    this.removeMode = mode;
  }


  async confirmRemove() {
    if (!this.modalUser) return;

    try {
      if (this.removeMode === 'delete') {
        // DELETE real
        await this.adminService.deleteMember(this.league.id, this.modalUser.id);
        this.successMsg = "Usuario eliminado de la liga";
      } else {
        // PATCH inactivate
        await this.adminService.inactivateMember(this.league.id, this.modalUser.id);
        this.successMsg = "Usuario marcado como inactivo";
      }

      // 🔄 refrescar ligas del admin
      const updated = await this.leagueService.getMyCreatedLeagues();
      this.adminLeagues = updated;
      this.loadLeagueFromMemory(this.selectedLeagueIndex);

    } catch (e: any) {
      console.error(e);
      this.errorMsg =
        e?.error?.error || "No se pudo procesar la acción sobre el usuario.";
    }

    this.modalUser = null;
  }


  makeAdmin(u: MemberUser) {
    u.role = 'admin';
    this.successMsg = `${u.username} ahora es administrador 👑`;
  }

  removeAdmin(u: MemberUser) {
    if (u.id === this.league.created_by) {
      this.errorMsg = "No podés quitar el admin al creador de la liga.";
      return;
    }

    u.role = 'member';
    this.successMsg = `${u.username} ya no es administrador`;
  }

  async saveChanges() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    try {
      // 1️⃣ Guardar cambios de liga
      await this.leagueService.updateLeague(this.league.id, {
        name: this.league.name,
        description: this.league.description,
        privacy: this.isPrivate ? 'private' : 'public'
      });

      // 2️⃣ Procesar invitaciones nuevas
      const newInvites = this.members.filter(m => m._new && m.status === 'pending');

      for (const u of newInvites) {
        await this.adminService.inviteUserToLeague(this.league.id, u.id);
        u._new = false;
      }

      this.successMsg = "Cambios guardados ✔";

    } catch (e) {
      console.error(e);
      this.errorMsg = "No se pudieron guardar los cambios.";
    }

    this.saving = false;
  }


}
