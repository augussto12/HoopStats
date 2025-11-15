import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToHead } from './head-to-head';

describe('HeadToHead', () => {
  let component: HeadToHead;
  let fixture: ComponentFixture<HeadToHead>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadToHead]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadToHead);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
