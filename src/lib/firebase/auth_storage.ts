import {Injectable, signal} from "@angular/core";
import {browserSessionPersistence, onAuthStateChanged, setPersistence, signInWithCustomToken, User} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";

import {auth, db} from "./app";
import {TokenSnapshot} from "../models/user_metadata";
import {httpsCallable} from "firebase/functions";
import {functions} from "./functions";

const HALF_HOUR = 1000 * 60 * 30; // in milliseconds

/**
 * Lightweight wrapper around the Firebase auth API to play nicely with Angular.
 * We also want this to be fairly small and self-contained so it can be
 * imported into other pages without having to import all of the custom Firebase
 * related code to reduce bundle size.
 */
@Injectable({providedIn: 'root'})
export class AuthStorage {
  readonly currentUser = signal<User | null>(null);
  /**
   * Indicates whether the auth storage has checked the auth state at least
   * once. Useful so that the application doesn't flash up content while we're
   * still trying to see if we have a user already.
   */
  readonly checkedOnce = signal<boolean>(false);

  constructor() {
    // Configure Firebase to store user session credentials in the user's
    // session storage so that they will stay logged in.
    setPersistence(auth, browserSessionPersistence);

    // Listen for when the user signs in and out.
    onAuthStateChanged(auth, async (user) => {
      try {
        await this.updateUser(user);
      } finally {
        this.checkedOnce.set(true);
      }
    });
  }

  async signInUser(token: string) {
    await signInWithCustomToken(auth, token);
    // No need to manually update the currentUser here -- there's a listener
    // on the auth state that's looking out for that.
  }

  protected async updateUser(user: User | null) {
    if (!user) {
      this.currentUser.set(null);
      return;
    }

    // Fetch the user's metadata, which includes their access token. The access
    // token has an expiration date, so we need to check if it is still valid.
    // If it is not, call out to the backend to refresh it so that the token
    // works in the long run.
    const snapshot = await getDoc(doc(db, "users", user.uid));

    // This is an edge case that probably will never happen, but better to cover
    // it explicitly anyway. If the user doesn't have metadata, we have no YNAB
    // account on file for them. We always create the user account *after*
    // successfully auth'ing with YNAB, so a user account with no YNAB data is
    // just sortof useless.
    if (!snapshot.exists) {
      return;
    }
    const data = snapshot.data();
    if (!data || !data['lastToken']) {
      return;
    }

    const lastToken = data['lastToken'] as TokenSnapshot;
    const now = new Date();

    // If we have at least 30 minutes left on the current stored token, then
    // we're good to go (for now).
    if (now.getTime() > lastToken.expires_at + HALF_HOUR) {
      this.currentUser.set(user);
      return;
    }

    const refreshYnabToken = httpsCallable(functions, 'refreshYnabToken');
    const refreshToken = await user.getIdToken();
    const res = await refreshYnabToken({refreshToken});
    const success = (res.data as any)?.success ?? false;

    // If we didn't succeed in refreshing the user's token, then we should just
    // not proceed for the time being. This gives the user an opportunity to
    // do the oauth process fresh.
    if (!success) return;

    // Otherwise, we're all done and this user should be good to go!
    this.currentUser.set(user);
  }
}
