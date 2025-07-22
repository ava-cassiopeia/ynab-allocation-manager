import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatTestDialogOpenerModule, MatTestDialogOpener} from '@angular/material/dialog/testing';

import {AccountMetadataDialog} from './account-metadata-dialog';

describe('AccountMetadataDialog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMetadataDialog, MatTestDialogOpenerModule],
      providers: [
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    MatTestDialogOpener.withComponent(AccountMetadataDialog);
  });
});
