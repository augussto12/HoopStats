import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FantasyService } from '../../../services/fantasy/fantasy-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fantasy-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './fantasy-home.html',
  styleUrls: ['./fantasy-home.css','../../predictions/prediction/prediction.css'],
})
export class FantasyHome implements OnInit {

  loading = false;

  constructor(private fantasyService: FantasyService) { }

  async ngOnInit() {
    let timeout: any;

    try {
      // Activamos el loading si tarda mas de 500ms
      timeout = setTimeout(() => this.loading = true, 500);

      await this.fantasyService.updateGlobalFantasyPoints();

    } catch (err) {
      console.error("Error actualizando puntos Fantasy:", err);
    } finally {
      clearTimeout(timeout);
      this.loading = false;
    }
  }
}
