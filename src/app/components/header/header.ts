import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { useGoBack } from '../../utils/navigation';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  public menuOpen = false;

  public goBack: () => void = useGoBack();

  constructor(
    public router: Router,
    public auth: AuthService
  ) {
    this.router.events.subscribe(() => {
      document.body.classList.remove("no-scroll");
    });
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove("no-scroll");
  }



  logout() {
    this.auth.logout();
  }
}