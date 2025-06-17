import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CurrencyCopyButton} from './currency-copy-button';

describe('CurrencyCopyButton', () => {
  let component: CurrencyCopyButton;
  let fixture: ComponentFixture<CurrencyCopyButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyCopyButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CurrencyCopyButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
