import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReconciledTime} from './reconciled-time';

describe('ReconciledTime', () => {
  let component: ReconciledTime;
  let fixture: ComponentFixture<ReconciledTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReconciledTime],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReconciledTime);
    fixture.componentRef.setInput('time', null);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
