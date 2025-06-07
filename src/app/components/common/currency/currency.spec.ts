import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Currency} from './currency';

describe('Currency', () => {
  let component: Currency;
  let fixture: ComponentFixture<Currency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Currency],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Currency);
    fixture.componentRef.setInput('milliunits', 1000);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
