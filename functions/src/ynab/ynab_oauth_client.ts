import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";
import {API} from "ynab";

import {TokenResponse, TokenSchema} from "./models";
import {tokenResponseToSchema} from "./token_response";

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
   * Given a JWT that identifies a user, attempts to refresh that user's
   * YNAB auth token, if we have an existing refresh token on file for them.
   *
   * @returns Returns true if the token was successfully refresh, or false
   *   otherwise.
   */
  async refreshAuthToken(idToken: string): Promise<boolean> {
    const decoded = await this.auth.verifyIdToken(idToken);
    const snapshot = await this.db.collection("users").doc(decoded.uid).get();

    if (!snapshot.exists) {
      logger.info(`Could not refresh user ${decoded.uid} auth token, they have no metadata.`);
      return false;
    }

    const oldToken: TokenSchema | null = snapshot.data()?.lastToken ?? null;
    if (!oldToken) {
      logger.info(`Could not refresh user ${decoded.uid} auth token, they have metadata but it doesn't include a token.`);
      return false;
    }

    const paramsBuilder = new URLSearchParams();
    paramsBuilder.set("client_id", this.config.clientId);
    paramsBuilder.set("client_secret", this.config.clientSecret);
    paramsBuilder.set("grant_type", "refresh_token");
    paramsBuilder.set("refresh_token", oldToken.refresh_token);

    const res = await fetch(`https://app.ynab.com/oauth/token?${paramsBuilder.toString()}`, {
      method: "POST",
    });
    const newToken = await res.json() as TokenResponse;

    await this.db.collection("users").doc(snapshot.id).update({
      lastToken: newToken,
    });
    return true;
  }

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
    const tokenSchema = tokenResponseToSchema(tokenResponse);

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
        lastToken: tokenSchema,
      });

      return await this.auth.createCustomToken(userDoc.id);
    } else {
      // Otherwise, if we don't yet have a user, let's create them and write
      // down their token & YNAB user ID.
      const userRecord = await this.auth.createUser({});

      await this.db.collection("users").doc(userRecord.uid).create({
        ynabUserId: ynabUser.id,
        lastToken: tokenSchema,
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
      throw new Error(`Couldn't get access token from YNAB: ${text} -- ${this.config.redirectUri}`);
    }
  }
}
