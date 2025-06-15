import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import {API} from "ynab";

import {TokenResponse} from "./models";

/**
 * Simple wrapper that handles Oauth behavior with YNAB.
 */
export class YnabOauthClient {
  private readonly db = getFirestore();
  private readonly auth = getAuth();

  constructor(private readonly config: {
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  }) {}

  /**
   * Given an authorization code from earlier steps in the oauth process (after
   * the user consents to access), goes through the steps to complete the
   * process, generate a new user, and write down this token for that user.
   *
   * @returns Returns a custom sign-in token that the frontend can use to sign
   *   in to Firebase with. We can't actually sign in the user here on the
   *   backend, so the best we can do is give them the one thing they need to
   *   do so on the frontend.
   */
  async signInNewUser(code: string): Promise<string> {
    const tokenResponse = await this.getAccessToken(code);

    // Now that we have a valid token, let's briefly authorize as the user to
    // look up their account. That allows us to match their YNAB account with
    // any account we may already have for them on file.
    const api = new API(tokenResponse.access_token);
    const ynabUser = (await api.user.getUser()).data.user;

    // Check if we already have a user for for the YNAB user.
    const snapshot = await this.db.collection("users").where("ynabUserId", "==", ynabUser.id).get();

    if (snapshot.docs.length > 1) {
      throw new Error(`Error fetching user for YNAB user: multiple (${snapshot.docs.length}) user matches occured for ${ynabUser.id}.`);
    }

    const hasUser = snapshot.docs.length === 1;
    if (hasUser) {
      // If we have a user, then we should update their token appropriately and
      // then return a sign-in token for them.
      const userDoc = snapshot.docs[0];

      await this.db.collection("users").doc(userDoc.id).update({
        lastToken: tokenResponse,
      });

      return await this.auth.createCustomToken(userDoc.id);
    } else {
      // Otherwise, if we don't yet have a user, let's create them and write
      // down their token & YNAB user ID.
      const userRecord = await this.auth.createUser({});

      await this.db.collection("users").doc(userRecord.uid).create({
        ynabUserId: ynabUser.id,
        lastToken: tokenResponse,
      });

      return await this.auth.createCustomToken(userRecord.uid);
    }
  }

  /**
   * Given an authorization code from earlier steps in the oauth process (after
   * the user consents to access), attempts to turn that code into a proper
   * access token.
   */
  async getAccessToken(code: string): Promise<TokenResponse> {
    const paramsBuilder = new URLSearchParams();
    paramsBuilder.set("client_id", this.config.clientId);
    paramsBuilder.set("client_secret", this.config.clientSecret);
    paramsBuilder.set("redirect_uri", this.config.redirectUri);
    paramsBuilder.set("grant_type", "authorization_code");
    paramsBuilder.set("code", code);

    const res = await fetch(`https://app.ynab.com/oauth/token?${paramsBuilder.toString()}`, {
      method: "POST",
    });

    if (res.ok) {
      return await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Couldn't get access token from YNAB: ${text}`);
    }
  }
}
