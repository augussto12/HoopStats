import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FantasyService } from '../../../services/fantasy/fantasy-service';

@Component({
  selector: 'app-fantasy-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './fantasy-home.html',
  styleUrl: './fantasy-home.css',
})
export class FantasyHome implements OnInit {

  constructor(private fantasyService: FantasyService) { }

  async ngOnInit() {
    try {
      await this.fantasyService.updateGlobalFantasyPoints();
    } catch (err) {
      console.error("Error actualizando puntos Fantasy:", err);
    }
  }
}
