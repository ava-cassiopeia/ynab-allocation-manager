import {Component, signal} from '@angular/core';

@Component({
  selector: 'ya-loading-silly-text',
  templateUrl: './loading-silly-text.html',
  styleUrl: './loading-silly-text.scss',
})
export class LoadingSillyText {
  protected readonly text = signal<string>('');

  private readonly options = [
    "There's always money in the banana stand",
    "It's dangerous to go alone! Take this...",
    "Counting beans so you don't have to",
    "Trying to make cents of everything",
    "Saving is a capital idea",
    "Loading legendary loot ledger",
    "Deploying cash to production",
    "Crunching numbers and snacks",
    "Balancing budgets and breakfast",
    "Dusting off the decimal points",
    "Finding loose change in the couch",
    "Sharpening pencils and interest rates",
    "Chasing runaway receipts",
  ];

  ngOnInit() {
    this.updateText();
  }

  private updateAfterDelay() {
    setTimeout(() => {
      this.updateText();
    }, 3000);
  }

  private updateText() {
    const newIndex = Math.floor(Math.random() * this.options.length);
    const newValue = this.options[newIndex];

    this.text.set(newValue);
    this.updateAfterDelay();
  }
}
