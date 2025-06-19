import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TotalAllocationsButton} from './total-allocations-button';
import {provideZonelessChangeDetection} from '@angular/core';

describe('TotalAllocationsButton', () => {
  let component: TotalAllocationsButton;
  let fixture: ComponentFixture<TotalAllocationsButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalAllocationsButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TotalAllocationsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
