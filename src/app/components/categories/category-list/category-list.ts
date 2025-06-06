import {Component, inject} from '@angular/core';
import {Category} from 'ynab';

import {Currency} from '../../common/currency/currency';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {Allocation} from '../../../../lib/models/allocation';

@Component({
  selector: 'ya-category-list',
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
  imports: [Currency],
})
export class CategoryList {
  protected readonly ynabStorage = inject(YnabStorage);
  protected readonly firestoreStorage = inject(FirestoreStorage);

  protected addAllocationFor(category: Category) {
    this.firestoreStorage.addAllocation(new Allocation(category.id, 'fake_account_id'));
  }
}
