import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MonthsInfoButton} from './months-info-button';

describe('MonthsInfoButton', () => {
  let component: MonthsInfoButton;
  let fixture: ComponentFixture<MonthsInfoButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsInfoButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MonthsInfoButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
