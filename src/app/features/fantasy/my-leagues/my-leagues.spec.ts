import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLeagues } from './my-leagues';

describe('MyLeagues', () => {
  let component: MyLeagues;
  let fixture: ComponentFixture<MyLeagues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLeagues]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyLeagues);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
