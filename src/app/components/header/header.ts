import { Component } from '@angular/core';
import { RouterModule, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { useGoBack } from '../../utils/navigation';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLinkActive],
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

  public logout(): void {
    this.auth.logout();
  }

  public toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  public closeMenu(): void {
    this.menuOpen = false;
  }
}