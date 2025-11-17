import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FantasyHome } from './fantasy-home';

describe('FantasyHome', () => {
  let component: FantasyHome;
  let fixture: ComponentFixture<FantasyHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FantasyHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FantasyHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
