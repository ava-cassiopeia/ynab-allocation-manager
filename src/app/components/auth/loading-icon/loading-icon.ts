import {Component, signal, ElementRef} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'ya-loading-icon',
  templateUrl: './loading-icon.html',
  styleUrl: './loading-icon.scss',
  imports: [MatIcon],
})
export class LoadingIcon {
  private readonly icons = [
    'account_balance',
    'account_balance_wallet',
    'credit_card',
    'savings',
    'point_of_sale',
  ];
  private iconsIndex = Math.floor(Math.random() * (this.icons.length - 1));

  protected readonly icon = signal<string>(this.icons[this.iconsIndex]);
  protected readonly nextIcon = signal<string>(this.icons[this.iconsIndex + 1]);
  protected readonly changing = signal<boolean>(false);

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.waitAndSwap();
  }

  private waitAndSwap() {
    setTimeout(() => {
      this.swap();
    }, 750);
  }

  private async swap() {
    if (this.changing()) return;

    this.changing.set(true);
    await this.waitForAnimation();
    this.changing.set(false);
    this.updateIcons();

    this.waitAndSwap();
  }

  private updateIcons() {
    this.iconsIndex += 1;
    let nextIndex = this.iconsIndex + 1;
    if (this.iconsIndex === this.icons.length - 1) {
      nextIndex = 0;
    } else if (this.iconsIndex >= this.icons.length) {
      this.iconsIndex = 0;
      nextIndex = 1;
    }

    this.icon.set(this.icons[this.iconsIndex]);
    this.nextIcon.set(this.icons[nextIndex]);
  }

  private waitForAnimation(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const nextIconEl = this.el.nativeElement.querySelector(".next-icon")!;
        nextIconEl.addEventListener("transitionend", () => {
          resolve();
        }, {once: true});
      });
    });
  }
}
