import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersByTeam } from './players-by-team';

describe('PlayersByTeam', () => {
  let component: PlayersByTeam;
  let fixture: ComponentFixture<PlayersByTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersByTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersByTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
