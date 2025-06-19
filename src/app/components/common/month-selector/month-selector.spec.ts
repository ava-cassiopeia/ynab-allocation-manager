import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MonthSelector} from './month-selector';

describe('MonthSelector', () => {
  let component: MonthSelector;
  let fixture: ComponentFixture<MonthSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSelector],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MonthSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
