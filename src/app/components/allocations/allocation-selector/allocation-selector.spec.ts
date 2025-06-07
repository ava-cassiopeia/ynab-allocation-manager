import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AllocationSelector} from './allocation-selector';

describe('AllocationSelector', () => {
  let component: AllocationSelector;
  let fixture: ComponentFixture<AllocationSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationSelector],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AllocationSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
