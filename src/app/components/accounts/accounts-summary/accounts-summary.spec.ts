import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountsSummary} from './accounts-summary';
import {provideZonelessChangeDetection} from '@angular/core';

describe('AccountsSummary', () => {
  let component: AccountsSummary;
  let fixture: ComponentFixture<AccountsSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsSummary],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountsSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
