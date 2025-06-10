import {Component, signal, input} from '@angular/core';

@Component({
  selector: 'ya-dropdown-button',
  templateUrl: './dropdown-button.html',
  styleUrl: './dropdown-button.scss'
})
export class DropdownButton {
  readonly dropdownLabel = input.required<string>();
  readonly theme = input<ButtonTheme>('default');

  protected readonly showDropdown = signal<boolean>(false);

  close() {
    this.showDropdown.set(false);
  }

  protected toggleDropdown() {
    this.showDropdown.update((s) => !s);
  }
}

export type ButtonTheme = 'default' | 'overage' | 'warning' | 'perfect';
