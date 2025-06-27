import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideZonelessChangeDetection} from '@angular/core';

import {SplitSelector} from './split-selector';

describe('SplitSelector', () => {
  let component: SplitSelector;
  let fixture: ComponentFixture<SplitSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitSelector],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SplitSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
