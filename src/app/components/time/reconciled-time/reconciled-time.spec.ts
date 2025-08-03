import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ReconciledTime} from './reconciled-time';
import {RelativeTime} from '../relative-time/relative-time';

describe('ReconciledTime', () => {
  let component: ReconciledTime;
  let fixture: ComponentFixture<ReconciledTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReconciledTime],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReconciledTime);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('time', null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a dash when time is null', () => {
    fixture.componentRef.setInput('time', null);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.css('span'));
    expect(debugEl).not.toBeNull();
    expect(debugEl.nativeElement.textContent).toBe('-');
    expect(fixture.debugElement.query(By.css('ya-relative-time'))).toBeNull();
  });

  it('should render a dash when time is undefined', () => {
    fixture.componentRef.setInput('time', undefined);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.css('span'));
    expect(debugEl).not.toBeNull();
    expect(debugEl.nativeElement.textContent).toBe('-');
    expect(fixture.debugElement.query(By.css('ya-relative-time'))).toBeNull();
  });

  it('should render relative time when time is a valid date string', () => {
    const date = new Date();
    fixture.componentRef.setInput('time', date.toISOString());
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(RelativeTime));
    expect(debugEl).not.toBeNull();
    expect(debugEl.componentInstance.date()).toEqual(date);
    expect(fixture.debugElement.query(By.css('span'))).toBeNull();
  });

  it('should update from value to null', () => {
    const date = new Date();
    fixture.componentRef.setInput('time', date.toISOString());
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(RelativeTime))).not.toBeNull();

    fixture.componentRef.setInput('time', null);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.css('span'));
    expect(debugEl).not.toBeNull();
    expect(debugEl.nativeElement.textContent).toBe('-');
    expect(fixture.debugElement.query(By.directive(RelativeTime))).toBeNull();
  });
});
