import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Account, AccountType} from 'ynab';

import {AccountSummary} from './account-summary';

describe('AccountSummary', () => {
  let component: AccountSummary;
  let fixture: ComponentFixture<AccountSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSummary],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();
    const account: Account = {
      id: 'fake_account',
      name: 'Fake account',
      type: AccountType.Cash,
      on_budget: true,
      closed: false,
      balance: 1000,
      cleared_balance: 1000,
      uncleared_balance: 0,
      transfer_payee_id: 'fake_id',
      deleted: false,
    };

    fixture = TestBed.createComponent(AccountSummary);
    fixture.componentRef.setInput('account', account);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
