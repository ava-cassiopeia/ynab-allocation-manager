import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AllocationCountButton} from './allocation-count-button';

describe('AllocationCountButton', () => {
  let component: AllocationCountButton;
  let fixture: ComponentFixture<AllocationCountButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationCountButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AllocationCountButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
