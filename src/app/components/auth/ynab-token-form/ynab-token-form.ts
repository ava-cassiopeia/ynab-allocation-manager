import {Component, inject} from '@angular/core';
import {ReactiveFormsModule, FormControl} from '@angular/forms';

import {YnabClient} from '../../../../lib/ynab/ynab_client';

@Component({
  selector: 'ya-ynab-token-form',
  templateUrl: './ynab-token-form.html',
  styleUrl: './ynab-token-form.scss',
  imports: [ReactiveFormsModule],
})
export class YnabTokenForm {
  protected readonly tokenInput = new FormControl<string>('');

  private readonly ynabClient = inject(YnabClient);

  protected updateToken() {
    const newToken = this.tokenInput.value?.trim() ?? '';
    if (newToken === '') return;

    this.ynabClient.setApiKey(newToken);
  }
}
