import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLeague } from './admin-league';

describe('AdminLeague', () => {
  let component: AdminLeague;
  let fixture: ComponentFixture<AdminLeague>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLeague]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLeague);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
