import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoadingSillyText} from './loading-silly-text';

describe('LoadingSillyText', () => {
  let component: LoadingSillyText;
  let fixture: ComponentFixture<LoadingSillyText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSillyText],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoadingSillyText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
