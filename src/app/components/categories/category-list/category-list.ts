import {Component, inject} from '@angular/core';

import {Currency} from '../../common/currency/currency';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-category-list',
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
  imports: [Currency],
})
export class CategoryList {
  protected readonly ynabStorage = inject(YnabStorage);
}
