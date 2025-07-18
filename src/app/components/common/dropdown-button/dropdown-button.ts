import {Component, signal, input, ViewChild, booleanAttribute} from '@angular/core';
import {CdkMenuTrigger, CdkMenu, CdkMenuItem} from '@angular/cdk/menu';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'ya-dropdown-button',
  templateUrl: './dropdown-button.html',
  styleUrl: './dropdown-button.scss',
  imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem, MatIcon],
})
export class DropdownButton<MenuItemType> {
  readonly dropdownLabel = input.required<string>();
  readonly menuItems = input<DropdownMenuItem<MenuItemType>[]>([]);
  readonly theme = input<ButtonTheme>('default');
  readonly icon = input<string | null>(null);
  readonly flat = input(false, {transform: booleanAttribute});
  readonly disabled = input(false, {transform: booleanAttribute});
  readonly noClose = input(false, {transform: booleanAttribute});
  readonly pastel = input(false, {transform: booleanAttribute});

  protected readonly dropdownShowing = signal<boolean>(false);

  @ViewChild(CdkMenuTrigger)
  private readonly cdkMenuTrigger!: CdkMenuTrigger;

  close() {
    this.cdkMenuTrigger.close();
  }

  protected toggleDropdown() {
    this.cdkMenuTrigger.toggle();
  }
}

export interface DropdownMenuItem<ValueType> {
  readonly label: string;
  readonly icon?: string;
  readonly action: (value: ValueType) => void,
  readonly value: ValueType,
}

export type ButtonTheme = 'default' | 'overfunded' | 'underfunded' | 'warning' | 'perfect' | 'site-theme';
