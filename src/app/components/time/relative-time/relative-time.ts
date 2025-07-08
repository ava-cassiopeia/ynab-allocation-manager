import {Component, input, computed} from '@angular/core';

@Component({
  selector: 'ya-relative-time',
  templateUrl: './relative-time.html',
  styleUrl: './relative-time.scss',
})
export class RelativeTime {
  readonly date = input.required<Date>();

  protected readonly label = computed<string>(() => {
    // Note that because this is not a signal, this computed signal will not
    // update as time changes, just as the date() input changes. In all but some
    // specific edge-cases, users won't notice this subtlety.
    const now = new Date();
    const deltaMs = now.getTime() - this.date().getTime();
    const deltaDays = Math.floor(deltaMs / 1000.0 / 60.0 / 24.0);

    if (deltaDays <= 0) {
      return 'Today';
    } else if (deltaDays === 1) {
      return '1 day ago';
    } else {
      return `${deltaDays} days ago`;
    }
  });
}
