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
  ) { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    // Evitar scroll del body
    document.body.style.overflow = this.menuOpen ? 'hidden' : 'auto';
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflow = "auto";
  }

  logout() {
    this.auth.logout();
  }
}