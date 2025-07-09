import {Component, Input, provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {Category, CategoryGroupWithCategories} from 'ynab';

import {AllocationCountButton} from './allocation-count-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {Allocation, AllocationType} from '../../../../lib/models/allocation';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';

// Mock DropdownButton
@Component({
  selector: 'ya-dropdown-button',
  template: `
    <div class="projected-label">
      <ng-content select="[label]"></ng-content>
    </div>
    <div class="projected-dropdown-content">
      <ng-content select="[dropdown]"></ng-content>
    </div>
    <hr/>
    <p>Input dropdownLabel: {{ dropdownLabel }}</p>
    <p>Input icon: {{ icon }}</p>
    <p>Input theme: {{ theme }}</p>
  `,
  standalone: true,
})
class MockDropdownButton {
  @Input() dropdownLabel: string = '';
  @Input() icon: string = '';
  @Input() theme: string = '';
  // Keep these if they are used by the real DropdownButton or for clarity,
  // even if not directly bound in AllocationCountButton's template to ya-dropdown-button
  @Input() allocatedCategories: number = 0;
  @Input() totalCategories: number = 0;
}


// Mock YnabStorage
class MockYnabStorage {
  private _latestCategoriesSignal = signal<CategoryGroupWithCategories[]>([]);
  latestCategories = {
    value: this._latestCategoriesSignal.asReadonly(),
    // Mock other ResourceRef properties if needed by the component under test,
    // for now, only `value` is used by AllocationCountButton.
    isLoading: () => false,
    error: () => null,
    state: () => 'resolved',
  } as any; // Use 'as any' to simplify if not all ResourceRef props are mocked

  // Helper for tests to set the categories
  setLatestCategories(categories: CategoryGroupWithCategories[]) {
    this._latestCategoriesSignal.set(categories);
  }
}

// Mock FirestoreStorage
class MockFirestoreStorage {
  allocations = signal<Allocation[]>([]);
}

describe('AllocationCountButton', () => {
  let component: AllocationCountButton;
  let fixture: ComponentFixture<AllocationCountButton>;
  let mockYnabStorage: MockYnabStorage;
  let mockFirestoreStorage: MockFirestoreStorage;

  beforeEach(async () => {
    mockYnabStorage = new MockYnabStorage();
    mockFirestoreStorage = new MockFirestoreStorage();

    TestBed.overrideComponent(AllocationCountButton, {
      remove: {imports: [DropdownButton]},
      add: {imports: [MockDropdownButton]},
    });

    await TestBed.configureTestingModule({
      imports: [AllocationCountButton],
      providers: [
        provideZonelessChangeDetection(),
        {provide: YnabStorage, useValue: mockYnabStorage},
        {provide: FirestoreStorage, useValue: mockFirestoreStorage},
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocationCountButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('status computed signal', () => {
    it('should calculate totalCategories correctly with no categories', () => {
      mockYnabStorage.setLatestCategories([]);
      fixture.detectChanges();
      expect((component as any).status().totalCategories).toBe(0);
    });

    it('should calculate totalCategories correctly with some categories', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      fixture.detectChanges();
      expect((component as any).status().totalCategories).toBe(2);
    });

    it('should calculate totalCategories correctly ignoring hidden categories', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: true, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      fixture.detectChanges();
      expect((component as any).status().totalCategories).toBe(1);
    });

    it('should calculate totalCategories correctly ignoring deleted categories', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: true, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      fixture.detectChanges();
      expect((component as any).status().totalCategories).toBe(1);
    });

    it('should calculate totalCategories correctly ignoring hidden and deleted categories', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: true, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat3', name: 'Category 3', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: true, category_group_name: 'Group 1'} as Category,
            {id: 'cat4', name: 'Category 4', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: true, deleted: true, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      fixture.detectChanges();
      expect((component as any).status().totalCategories).toBe(1);
    });

    it('should calculate allocatedCategories correctly with no allocations', () => {
      mockFirestoreStorage.allocations.set([]);
      fixture.detectChanges();
      expect((component as any).status().allocatedCategories).toBe(0);
    });

    it('should calculate allocatedCategories correctly with some allocations', () => {
      mockFirestoreStorage.allocations.set([
        {id: 'alloc1', budgetId: 'b1', categoryId: 'c1', accountId: 'acc1', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c1', type: AllocationType.SINGLE, accountId: 'acc1'})} as Allocation,
        {id: 'alloc2', budgetId: 'b1', categoryId: 'c2', accountId: 'acc2', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c2', type: AllocationType.SINGLE, accountId: 'acc2'})} as Allocation,
      ]);
      fixture.detectChanges();
      expect((component as any).status().allocatedCategories).toBe(2);
    });

    it('should calculate status correctly with mixed categories and allocations', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat3', name: 'Category 3', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: true, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      mockFirestoreStorage.allocations.set([{id: 'alloc1', budgetId: 'b1', categoryId: 'c1', accountId: 'acc1', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c1', type: AllocationType.SINGLE, accountId: 'acc1'})} as Allocation]);
      fixture.detectChanges();
      const status = (component as any).status();
      expect(status.totalCategories).toBe(2);
      expect(status.allocatedCategories).toBe(1);
    });
  });

  describe('template', () => {
    it('should display the correct counts in the dropdown button', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      mockFirestoreStorage.allocations.set([{id: 'alloc1', budgetId: 'b1', categoryId: 'c1', accountId: 'acc1', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c1', type: AllocationType.SINGLE, accountId: 'acc1'})} as Allocation]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('1 of 2');
    });

    it('should update the display when status changes', () => {
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat3', name: 'Category 3', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      mockFirestoreStorage.allocations.set([{id: 'alloc1', budgetId: 'b1', categoryId: 'c1', accountId: 'acc1', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c1', type: AllocationType.SINGLE, accountId: 'acc1'})} as Allocation]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('1 of 3');

      // Update allocations
      mockFirestoreStorage.allocations.set([
        {id: 'alloc1', budgetId: 'b1', categoryId: 'c1', accountId: 'acc1', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c1', type: AllocationType.SINGLE, accountId: 'acc1'})} as Allocation,
        {id: 'alloc2', budgetId: 'b1', categoryId: 'c2', accountId: 'acc2', toSchema: (userId: string) => ({userId, budgetId: 'b1', categoryId: 'c2', type: AllocationType.SINGLE, accountId: 'acc2'})} as Allocation,
      ]);
      fixture.detectChanges();
      expect(compiled.textContent).toContain('2 of 3');

      // Update categories
      mockYnabStorage.setLatestCategories([
        {
          id: 'group1',
          name: 'Group 1',
          hidden: false,
          deleted: false,
          categories: [
            {id: 'cat1', name: 'Category 1', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat2', name: 'Category 2', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat3', name: 'Category 3', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
            {id: 'cat4', name: 'Category 4', goal_type: null, goal_creation_month: null, goal_target: null, goal_target_month: null, goal_percentage_complete: null, category_group_id: 'group1', note: null, month: null, budgeted: 0, activity: 0, balance: 0, hidden: false, deleted: false, category_group_name: 'Group 1'} as Category,
          ],
        } as CategoryGroupWithCategories,
      ]);
      fixture.detectChanges();
      expect(compiled.textContent).toContain('2 of 4');
    });
  });
});
