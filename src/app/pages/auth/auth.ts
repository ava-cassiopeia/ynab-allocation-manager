import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {httpsCallable} from 'firebase/functions';

import {AuthStorage} from '../../../lib/firebase/auth_storage';
import {LoadingIcon} from '../../components/auth/loading-icon/loading-icon';
import {LoadingSillyText} from '../../components/auth/loading-silly-text/loading-silly-text';
import {functions} from '../../../lib/firebase/functions';

@Component({
  selector: 'ya-auth-page',
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  imports: [LoadingIcon, LoadingSillyText],
})
export class AuthPage {
  protected readonly hasCode = signal<boolean>(true);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authStorage = inject(AuthStorage);

  async ngAfterViewInit() {
    // YNAB's oauth API will give us back a code we can use to obtain a token
    // to authorize as the user.
    const code = this.route.snapshot.queryParamMap.get('code');

    // If we didn't get a code back, just throw up a screen that says auth
    // didn't work.
    if (code === null || code.trim() === '') {
      this.hasCode.set(false);
      return;
    }

    const oauthLogIn = httpsCallable(functions, "oauthLogIn");

    const res = await oauthLogIn({code});
    const token = (res.data as any).token ?? null;

    if (token === null) {
      this.hasCode.set(false);
      return;
    }

    await this.authStorage.signInUser(token);
    this.router.navigate(["app"]);
  }
}
