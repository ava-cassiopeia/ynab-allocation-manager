import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountStatusIndicator} from './account-status-indicator';

describe('AccountStatusIndicator', () => {
  let component: AccountStatusIndicator;
  let fixture: ComponentFixture<AccountStatusIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatusIndicator],
      providers: [provideZonelessChangeDetection()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatusIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
