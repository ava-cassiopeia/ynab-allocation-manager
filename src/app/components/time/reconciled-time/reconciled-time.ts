import {Component, input, computed} from '@angular/core';
import {RelativeTime} from '../relative-time/relative-time';

@Component({
  selector: 'ya-reconciled-time',
  templateUrl: './reconciled-time.html',
  styleUrl: './reconciled-time.scss',
  imports: [RelativeTime],
})
export class ReconciledTime {
  readonly time = input.required<string | null | undefined>();

  protected readonly date = computed<Date | null>(() => {
    const time = this.time();
    if (!time) return null;

    return new Date(time);
  });
}
