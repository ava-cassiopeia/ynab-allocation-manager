import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ClearAllocationsDialog} from './clear-allocations-dialog';

describe('ClearAllocationsDialog', () => {
  let component: ClearAllocationsDialog;
  let fixture: ComponentFixture<ClearAllocationsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearAllocationsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ClearAllocationsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
