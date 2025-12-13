import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  private loading = inject(LoadingService);
  private auth = inject(AuthService);

  constructor() {
    this.auth.initSession();

    this.loading.loading$
      .pipe(takeUntilDestroyed())
      .subscribe(isLoading => {
        document.body.classList.toggle('no-scroll', isLoading);
      });
  }

}
