import {Injectable, signal} from "@angular/core";

/**
 * Stores cached YNAB data for the application.
 */
@Injectable({providedIn: 'root'})
export class YnabStorage {
  readonly apiKey = signal<string | null>(null);
}
