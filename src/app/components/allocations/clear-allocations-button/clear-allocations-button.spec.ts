import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ClearAllocationsButton} from './clear-allocations-button';
import {provideZonelessChangeDetection} from '@angular/core';

describe('ClearAllocationsButton', () => {
  let component: ClearAllocationsButton;
  let fixture: ComponentFixture<ClearAllocationsButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearAllocationsButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClearAllocationsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
