import {Component, inject} from '@angular/core';

import {Currency} from '../../common/currency/currency';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {AllocationSelector} from '../../allocations/allocation-selector/allocation-selector';

@Component({
  selector: 'ya-category-list',
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
  imports: [Currency, AllocationSelector],
})
export class CategoryList {
  protected readonly ynabStorage = inject(YnabStorage);
  protected readonly firestoreStorage = inject(FirestoreStorage);
}
