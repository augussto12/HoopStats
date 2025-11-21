import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fantasy-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './fantasy-home.html',
  styleUrls: ['./fantasy-home.css', '../../predictions/prediction/prediction.css'],
})
export class FantasyHome {

}
