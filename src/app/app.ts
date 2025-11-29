import { Component, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';
import { Header } from './components/header/header';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { SessionExpiringModal } from './modal-session-expiring.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, GlobalLoaderComponent, SessionExpiringModal],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  private router = inject(Router);
  private loading = inject(LoadingService);
  private auth = inject(AuthService);

  constructor() {

    // Inicializar la sesión del usuario al cargar la aplicación
    this.auth.initSession();
    this.auth.startTokenWatcher();
    // Manejo de carga por navegacion
    this.router.events
      .pipe(takeUntilDestroyed())
      .subscribe(event => {

        if (event instanceof NavigationStart) {
          this.loading.show();
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.loading.hide();
        }

      });

    this.loading.loading$
      .pipe(takeUntilDestroyed())
      .subscribe(isLoading => {
        if (isLoading) {
          document.body.classList.add('no-scroll');
        } else {
          document.body.classList.remove('no-scroll');
        }
      });

  }
}
