import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsFantasy } from './standings-fantasy';

describe('StandingsFantasy', () => {
  let component: StandingsFantasy;
  let fixture: ComponentFixture<StandingsFantasy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsFantasy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandingsFantasy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
