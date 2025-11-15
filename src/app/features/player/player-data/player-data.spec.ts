import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerData } from './player-data';

describe('PlayerData', () => {
  let component: PlayerData;
  let fixture: ComponentFixture<PlayerData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
