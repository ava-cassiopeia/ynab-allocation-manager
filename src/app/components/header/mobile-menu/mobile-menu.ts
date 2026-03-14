import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuTrigger, MatMenuItem} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {SettingsStorage} from '../../../../lib/firebase/settings_storage';
import {SettingsDialog} from '../../settings/settings-dialog/settings-dialog';
import {ClearAllocationsDialog} from './clear-allocations-dialog/clear-allocations-dialog';
import {auth} from '../../../../lib/firebase/app';

@Component({
  selector: 'ya-mobile-menu',
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  imports: [MatIcon, MatMenu, MatMenuTrigger, MatMenuItem],
})
export class MobileMenu {
  protected readonly ynabStorage = inject(YnabStorage);
  protected readonly settingsStorage = inject(SettingsStorage);

  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected showSettingsDialog() {
    this.dialog.open(SettingsDialog);
  }

  protected showClearAllocationsDialog() {
    this.dialog.open(ClearAllocationsDialog);
  }

  protected async logout() {
    await auth.signOut();
    void this.router.navigate(['']);
  }
}
