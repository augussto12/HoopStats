import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPredictions } from './my-predictions';

describe('MyPredictions', () => {
  let component: MyPredictions;
  let fixture: ComponentFixture<MyPredictions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPredictions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPredictions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
