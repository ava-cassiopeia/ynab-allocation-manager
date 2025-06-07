import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountList} from './account-list';

describe('AccountList', () => {
  let component: AccountList;
  let fixture: ComponentFixture<AccountList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountList],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
