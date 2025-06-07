import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountSummary} from './account-summary';

describe('AccountSummary', () => {
  let component: AccountSummary;
  let fixture: ComponentFixture<AccountSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSummary]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
