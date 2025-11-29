import { Component, Injector, OnInit, HostListener } from '@angular/core';
import { User } from '../../../models/interfaces';
import { UserService } from '../../../services/user.service';
import { AdminLeagueService } from '../../../services/admin-league.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FantasyLeaguesService } from '../../../services/fantasy-leagues.service';
import { WithLoader } from '../../../decorators/with-loader.decorator';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

export type MemberUser = User & {
  role: 'admin' | 'member';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  invite_id?: number;
  origin?: 'team' | 'invite';

  _new?: boolean;
  _delete?: boolean;
  _inactivate?: boolean;
  _promote?: boolean;
  _demote?: boolean;
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

  adminLeagues: any[] = [];
  selectedLeagueIndex = 0;

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

  hasChanges = false;
  skipUnsavedCheck = false;

  showUnsavedModal = false;
  pendingAction: (() => void) | null = null;

  constructor(
    private adminService: AdminLeagueService,
    private leagueService: FantasyLeaguesService,
    private userService: UserService,
    private router: Router,
    private auth: AuthService,
    public injector: Injector
  ) {
    this.interceptNavigation();
  }

  // ==============================
  // ⚡ Interceptor de navegación
  // ==============================
  private interceptNavigation() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {

        if (this.skipUnsavedCheck) {
          this.skipUnsavedCheck = false;
          return;
        }

        if (!this.hasChanges) return;

        const targetUrl = event.url;

        this.router.navigateByUrl(this.router.url, { replaceUrl: true });

        this.openUnsavedChangesModal(() => {
          this.hasChanges = false;
          this.skipUnsavedCheck = true;
          this.router.navigateByUrl(targetUrl);
        });

      });
  }

  @HostListener('window:beforeunload', ['$event'])
  warnBeforeUnload($event: any) {
    if (this.hasChanges) {
      $event.returnValue = true;
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBack(event: PopStateEvent) {

    if (this.skipUnsavedCheck) {
      this.skipUnsavedCheck = false;
      return;
    }

    if (!this.hasChanges) return;

    event.preventDefault?.();

    const current = this.router.url;

    this.openUnsavedChangesModal(() => {
      this.hasChanges = false;
      this.skipUnsavedCheck = true;
      history.back();
    });

    history.pushState(null, '', current);
  }

  markDirty() {
    this.hasChanges = true;
  }

  // ==============================
  // ⚡ INIT
  // ==============================
  async ngOnInit() {
    this.loading = true;

    try {
      // 🔥 Ahora solo una función que ya trae todo
      const leagues = await this.leagueService.getLeaguesWhereImAdmin();

      if (leagues.length === 0) {
        this.errorMsg = "No sos administrador de ninguna liga.";
        return;
      }

      this.adminLeagues = leagues;

      this.loadLeagueFromMemory(0);
      this.allUsers = await this.userService.getAllUsers();

    } catch (e) {
      console.error(e);
      this.errorMsg = "Error al cargar tus ligas.";
    }

    this.loading = false;
  }

  // ==============================
  // ⚡ Cargar liga en memoria
  // ==============================
  loadLeagueFromMemory(index: number) {
    const entry = this.adminLeagues[index];

    this.league = { ...entry.league };

    this.members = entry.members.map((m: any) => ({
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

  normalizeStatus(raw: string): MemberUser["status"] {
    switch (raw) {
      case 'active': return 'active';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'inactive';
    }
  }

  // ==============================
  // ⚡ Ver si es creador
  // ==============================
  isCreator(): boolean {
    const user = this.auth.getUser();
    return user && this.league?.created_by === user.id;
  }

  // ==============================
  // ⚡ ELIMINAR LIGA
  // ==============================
  // async deleteLeague() {
  //   if (!confirm("¿Seguro que querés eliminar esta liga? Esta acción no se puede deshacer.")) return;

  //   try {
  //     await this.adminService.deleteLeague(this.league.id);

  //     this.adminLeagues.splice(this.selectedLeagueIndex, 1);

  //     if (this.adminLeagues.length === 0) {
  //       this.errorMsg = "Ya no administrás ninguna liga.";
  //       this.league = null;
  //       return;
  //     }

  //     this.selectedLeagueIndex = 0;
  //     this.loadLeagueFromMemory(0);

  //   } catch (err) {
  //     console.error(err);
  //     this.errorMsg = "Error al eliminar la liga.";
  //   }
  // }

  // ==============================
  // ⚡ ACCIONES DE USUARIOS
  // ==============================
  isAlreadyMember(u: User): boolean {
    return this.members.some(m => m.id === u.id);
  }

  openRemoveModal(u: MemberUser, mode: 'delete' | 'inactivate') {
    this.modalUser = u;
    this.removeMode = mode;
  }

  confirmRemove() {
    if (!this.modalUser) return;

    if (this.removeMode === 'delete') this.modalUser._delete = true;
    if (this.removeMode === 'inactivate') {
      this.modalUser._inactivate = true;
      this.modalUser.status = 'inactive';
    }

    this.modalUser = null;
    this.markDirty();
  }

  makeAdmin(u: MemberUser) {
    u.role = 'admin';
    u._promote = true;
    u._demote = false;
    this.markDirty();
  }

  removeAdmin(u: MemberUser) {
    if (u.id === this.league.created_by) {
      this.errorMsg = "No podés quitar el admin al creador.";
      return;
    }

    u.role = 'member';
    u._demote = true;
    u._promote = false;
    this.markDirty();
  }

  attemptLeagueChange(newIndex: number) {
    if (this.hasChanges) {
      this.openUnsavedChangesModal(() => {
        this.selectedLeagueIndex = newIndex;
        this.hasChanges = false;
        this.loadLeagueFromMemory(newIndex);
      });
      return;
    }

    this.selectedLeagueIndex = newIndex;
    this.loadLeagueFromMemory(newIndex);
  }

  onFieldChanged() {
    this.markDirty();
  }

  // ==============================
  // ⚡ GUARDAR CAMBIOS
  // ==============================
  async saveChanges() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    try {
      await this.leagueService.updateLeague(this.league.id, {
        name: this.league.name,
        description: this.league.description,
        privacy: this.isPrivate ? 'private' : 'public'
      });

      const newInvites = this.members.filter(m => m._new);
      for (const u of newInvites) {
        await this.adminService.inviteUserToLeague(this.league.id, u.id);
        u._new = false;
      }

      const inactivated = this.members.filter(m => m._inactivate);
      for (const u of inactivated) {
        await this.adminService.inactivateMember(this.league.id, u.id);
        u._inactivate = false;
      }

      const deleted = this.members.filter(m => m._delete);
      for (const u of deleted) {
        await this.adminService.deleteMember(this.league.id, u.id);
      }

      this.members = this.members.filter(m => !m._delete);

      const promote = this.members.filter(m => m._promote);
      for (const u of promote) {
        await this.adminService.promoteUser(this.league.id, u.id);
        u._promote = false;
      }

      const demote = this.members.filter(m => m._demote);
      for (const u of demote) {
        await this.adminService.demoteUser(this.league.id, u.id);
        u._demote = false;
      }

      this.hasChanges = false;
      this.successMsg = "Cambios guardados ✔";

    } catch (e) {
      console.error(e);
      this.errorMsg = "No se pudieron guardar los cambios.";
    }

    this.saving = false;
  }

  onRemoveClicked(u: MemberUser) {
    // Si es nuevo, eliminar localmente sin modal
    if (u._new) {
      this.members = this.members.filter(m => m !== u);
      this.selectedUser = null;
      this.markDirty();
      return;
    }

    // Si no es nuevo modal normal
    this.openRemoveModal(u, 'delete');
    this.markDirty();
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  onUserChanged(user: User | null) {
    this.selectedUser = user;

    if (user && !this.isAlreadyMember(user)) {
      this.members.push({
        ...user,
        role: 'member',
        status: 'pending',
        origin: 'invite',
        _new: true
      });
      this.markDirty();
    }

    // 🔥 RESET VISUAL DEL SELECT:
    setTimeout(() => {
      this.selectedUser = null;
    }, 0);
  }



  confirmUnsavedExit() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showUnsavedModal = false;
  }

  cancelUnsavedExit() {
    this.pendingAction = null;
    this.showUnsavedModal = false;
  }

  openUnsavedChangesModal(action: () => void) {
    this.pendingAction = action;
    this.showUnsavedModal = true;
  }
}
