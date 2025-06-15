import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ya-auth-page',
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  protected readonly hasCode = signal<boolean>(true);

  private readonly route = inject(ActivatedRoute);

  ngAfterViewInit() {
    // YNAB's oauth API will give us back a code we can use to obtain a token
    // to authorize as the user.
    const code = this.route.snapshot.queryParamMap.get('code');

    // If we didn't get a code back, just throw up a screen that says auth
    // didn't work.
    if (code === null || code.trim() === '') {
      this.hasCode.set(false);
      return;
    }

    // TODO: THE THING
  }
}
