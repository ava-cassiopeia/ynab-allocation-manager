import {Component, inject, effect, computed} from '@angular/core';
import {Router} from '@angular/router';

import {AuthStorage} from '../../../lib/firebase/auth_storage';
import {MatIcon} from '@angular/material/icon';
import {YnabAuthManager} from '../../../lib/ynab/ynab_auth_manager';
import {version} from '../../../lib/version';

@Component({
  selector: 'ya-index-page',
  templateUrl: './index.html',
  styleUrl: './index.scss',
  imports: [MatIcon],
})
export class IndexPage {
  protected readonly auth = inject(YnabAuthManager);
  protected readonly loading = computed<boolean>(() => {
    return !this.authStorage.checkedOnce() || this.authStorage.currentUser() !== null;
  });
  // Mirror for the template
  protected readonly version = version;

  private readonly authStorage = inject(AuthStorage);
  private readonly router = inject(Router);

  constructor() {
    // If we find an existing user session, just jump straight into the app!
    effect(() => {
      const currentUser = this.authStorage.currentUser();
      if (currentUser === null) return;

      this.router.navigate(["app"]);
    });
  }
}
