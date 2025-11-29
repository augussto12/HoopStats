import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueDetails } from './league-details';

describe('LeagueDetails', () => {
  let component: LeagueDetails;
  let fixture: ComponentFixture<LeagueDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
