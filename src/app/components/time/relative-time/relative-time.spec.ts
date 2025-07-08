import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RelativeTime} from './relative-time';

describe('RelativeTime', () => {
  let component: RelativeTime;
  let fixture: ComponentFixture<RelativeTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeTime],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RelativeTime);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
