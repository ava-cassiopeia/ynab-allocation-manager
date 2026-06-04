import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

import {auth} from '../../../../lib/firebase/app';

@Component({
  selector: 'ya-logout-button',
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon],
})
export class LogoutButton {
  private readonly router = inject(Router);

  protected async logout() {
    await auth.signOut();
    void this.router.navigate(['']);
  }
}
