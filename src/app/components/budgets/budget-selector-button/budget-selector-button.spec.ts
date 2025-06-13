import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BudgetSelectorButton} from './budget-selector-button';

describe('BudgetSelectorButton', () => {
  let component: BudgetSelectorButton;
  let fixture: ComponentFixture<BudgetSelectorButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetSelectorButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BudgetSelectorButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
