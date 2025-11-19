import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PredictionCalulator } from '../../../services/predictions/prediction-calculator';

@Component({
  selector: 'app-prediction',
  imports: [RouterLink],
  templateUrl: './prediction.html',
  styleUrl: './prediction.css',
})
export class Prediction implements OnInit {

  constructor(private predCalc: PredictionCalulator) { }

  ngOnInit() {
    this.predCalc.evaluatePendingPredictions();
  }
}
