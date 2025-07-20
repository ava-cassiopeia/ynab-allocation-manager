import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountMetadataDialog} from './account-metadata-dialog';
import {provideZonelessChangeDetection} from '@angular/core';

describe('AccountMetadataDialog', () => {
  let component: AccountMetadataDialog;
  let fixture: ComponentFixture<AccountMetadataDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMetadataDialog],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccountMetadataDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
