import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BudgetSelector} from './budget-selector';

describe('BudgetSelector', () => {
  let component: BudgetSelector;
  let fixture: ComponentFixture<BudgetSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetSelector]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BudgetSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
