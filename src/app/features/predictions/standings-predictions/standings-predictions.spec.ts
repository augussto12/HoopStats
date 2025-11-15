import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsPredictions } from './standings-predictions';

describe('StandingsPredictions', () => {
  let component: StandingsPredictions;
  let fixture: ComponentFixture<StandingsPredictions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsPredictions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandingsPredictions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
