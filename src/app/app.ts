import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';

import {FirestoreStorage} from '../lib/firestore/firestore_storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet],
})
export class App implements OnInit {
  private readonly firestoreStorage = inject(FirestoreStorage);

  async ngOnInit() {
    await this.firestoreStorage.signInUser();
  }
}
