import {Component, input, computed} from '@angular/core';
import {RelativeTime} from '../relative-time/relative-time';

@Component({
  selector: 'ya-reconciled-time',
  templateUrl: './reconciled-time.html',
  styleUrl: './reconciled-time.scss',
  imports: [RelativeTime],
})
export class ReconciledTime {
  readonly time = input.required<Date | string | null | undefined>();

  protected readonly date = computed<Date | null>(() => {
    const time = this.time();
    if (!time) return null;
    if (time instanceof Date) return time;

    return new Date(time);
  });
}
