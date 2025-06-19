import {Injectable, signal} from "@angular/core";
import {signInAnonymously, User} from "firebase/auth";

import {auth} from "../firebase/app";
import {AuthStorage} from "../firebase/auth_storage";

@Injectable({providedIn: 'root'})
export class FakeAuthStorage extends AuthStorage {
  override readonly currentUser = signal<User | null>(null);

  setUser(uid: string) {
    // Minimal fake for testing
    this.currentUser.set({uid} as User);
  }

  async createFakeUser(): Promise<string> {
    const cred = await signInAnonymously(auth);
    this.setUser(cred.user.uid);
    return cred.user.uid;
  }

  override async updateUser(user: User | null) {
    // no op
  }
}
