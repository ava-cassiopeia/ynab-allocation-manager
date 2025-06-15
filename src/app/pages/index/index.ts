import {Component, inject} from '@angular/core';

import {YnabAuthManager} from '../../../lib/ynab/ynab_auth_manager';

@Component({
  selector: 'ya-index-page',
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class IndexPage {
  protected readonly auth = inject(YnabAuthManager);
}
