import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BetaInfoButton} from './beta-info-button';
import {provideZonelessChangeDetection} from '@angular/core';

describe('BetaInfoButton', () => {
  let component: BetaInfoButton;
  let fixture: ComponentFixture<BetaInfoButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetaInfoButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BetaInfoButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
