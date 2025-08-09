import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {AccountAllocation} from '../../../../lib/accounts/account_data';
import {AccountMetadata} from '../../../../lib/models/account_metadata';
import {InterestWarningButton} from './interest-warning-button';

describe('InterestWarningButton', () => {
  let component: InterestWarningButton;
  let fixture: ComponentFixture<InterestWarningButton>;

  async function createComponent(account: AccountAllocation) {
    await TestBed.configureTestingModule({
      imports: [InterestWarningButton],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(InterestWarningButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('account', account);
    fixture.detectChanges();
  }

  it('should create', async () => {
    await createComponent(EMPTY_ACCOUNT_ALLOCATION);
    expect(component).toBeTruthy();
  });

  it('should render a dropdown when there are not enough funds', async () => {
    await createComponent(NOT_ENOUGH_FUNDS_ACCOUNT_ALLOCATION);
    const dropdown = fixture.debugElement.query(By.css('ya-dropdown-button'));
    const span = fixture.debugElement.query(By.css('span:not([label])'));
    expect(dropdown).toBeTruthy();
    expect(span).toBeFalsy();
  });

  it('should render a span when there are enough funds', async () => {
    await createComponent(ENOUGH_FUNDS_ACCOUNT_ALLOCATION);
    const dropdown = fixture.debugElement.query(By.css('ya-dropdown-button'));
    const span = fixture.debugElement.query(By.css('span:not([label])'));
    expect(dropdown).toBeFalsy();
    expect(span).toBeTruthy();
  });

  it('should render a span when there is no interest data', async () => {
    await createComponent(EMPTY_ACCOUNT_ALLOCATION);
    const dropdown = fixture.debugElement.query(By.css('ya-dropdown-button'));
    const span = fixture.debugElement.query(By.css('span:not([label])'));
    expect(dropdown).toBeFalsy();
    expect(span).toBeTruthy();
  });
});

const EMPTY_ACCOUNT_METADATA = new AccountMetadata(
  'test-account',
  'test-budget',
  0,
  0,
  0,
  null,
);

const EMPTY_ACCOUNT_ALLOCATION: AccountAllocation = {
  account: {
    id: 'test-account',
    name: 'Test Account',
    type: 'checking',
    on_budget: true,
    closed: false,
    note: null,
    balance: 0,
    cleared_balance: 0,
    uncleared_balance: 0,
    transfer_payee_id: 'test-payee',
    direct_import_linked: false,
    direct_import_in_error: false,
    last_reconciled_at: null,
    debt_original_balance: null,
    debt_interest_rates: {},
    debt_minimum_payments: {},
    debt_escrow_amounts: {},
    deleted: false,
  },
  metadata: EMPTY_ACCOUNT_METADATA,
  categories: [],
  total: 0,
};

const NOT_ENOUGH_FUNDS_ACCOUNT_METADATA = new AccountMetadata(
  'test-account',
  'test-budget',
  0.02,
  100000,
  0,
  null,
);

const NOT_ENOUGH_FUNDS_ACCOUNT_ALLOCATION: AccountAllocation = {
  ...EMPTY_ACCOUNT_ALLOCATION,
  account: {
    ...EMPTY_ACCOUNT_ALLOCATION.account,
    cleared_balance: 50000,
  },
  metadata: NOT_ENOUGH_FUNDS_ACCOUNT_METADATA,
};

const ENOUGH_FUNDS_ACCOUNT_ALLOCATION: AccountAllocation = {
  ...NOT_ENOUGH_FUNDS_ACCOUNT_ALLOCATION,
  account: {
    ...NOT_ENOUGH_FUNDS_ACCOUNT_ALLOCATION.account,
    cleared_balance: 150000,
  },
};
