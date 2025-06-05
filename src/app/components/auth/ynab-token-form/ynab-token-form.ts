import {Component, inject} from '@angular/core';
import {ReactiveFormsModule, FormControl} from '@angular/forms';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-ynab-token-form',
  templateUrl: './ynab-token-form.html',
  styleUrl: './ynab-token-form.scss',
  imports: [ReactiveFormsModule],
})
export class YnabTokenForm {
  protected readonly tokenInput = new FormControl<string>('');

  private readonly ynabStorage = inject(YnabStorage);

  protected updateToken() {
    const newToken = this.tokenInput.value?.trim() ?? '';
    if (newToken === '') return;

    this.ynabStorage.apiKey.set(newToken);
  }
}
