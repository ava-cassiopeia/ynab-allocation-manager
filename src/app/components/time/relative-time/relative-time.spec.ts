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
    fixture.componentRef.setInput('date', new Date());
    component = fixture.componentInstance;
    // Initial detectChanges is not strictly necessary here as we will call it in each test.
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Today" for the current date', () => {
    const today = new Date();
    fixture.componentRef.setInput('date', today);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Today');
  });

  it('should display "1 day ago" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fixture.componentRef.setInput('date', yesterday);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1 day ago');
  });

  it('should display "X days ago" for a date a few days ago', () => {
    const fewDaysAgo = new Date();
    fewDaysAgo.setDate(fewDaysAgo.getDate() - 5); // 5 days ago
    fixture.componentRef.setInput('date', fewDaysAgo);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('5 days ago');
  });
});
