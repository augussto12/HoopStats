import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AdminLeagueService } from '../../services/admin-league.service';

import { NotificationItem } from '../../models/interfaces';
import { useGoBack } from '../../utils/navigation';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  menuOpen = false;
  showPanel = false;


  public goBack: () => void = useGoBack();

  constructor(
    public router: Router,
    public auth: AuthService,

  ) { }

  async ngOnInit() {

    // Quita el scroll cuando el menú cierra
    this.router.events.subscribe(() => {
      document.body.classList.remove("no-scroll");
    });
  }


  // ============================================
  //               MENÚ / LOGOUT
  // ============================================

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle("no-scroll", this.menuOpen);
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove("no-scroll");
  }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.showPanel = false;
    this.router.navigate(['/login']);
  }

}
