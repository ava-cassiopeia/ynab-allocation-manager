import nock from "nock";
import assert from "expect";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

import {YnabOauthClient} from "./ynab_oauth_client";

initializeApp();

describe("YnabOauthClient", () => {
  afterEach(async () => {
    const db = getFirestore();

    nock.cleanAll();
    // Clean up any generated user metadata
    const userDocs = await db.collection("users").get();
    for (const doc of userDocs.docs) {
      await db.collection("users").doc(doc.id).delete();
    }
  });

  describe(".getAccessToken()", () => {
    it("returns the appropriate token", async () => {
      const ynabClient = new YnabOauthClient({
        clientId: 'fake_client_id',
        clientSecret: 'fake_client_secret',
        redirectUri: 'http://fakehost',
      });

      const scope = nock("https://app.ynab.com");
      scope.post(/\/oauth\/token\?.*/)
          .reply(200, {
            access_token: "fake_access_token",
            token_type: "bearer",
            expires_in: 7200,
            refresh_token: "fake_refresh_token",
          });

      const tokenResponse = await ynabClient.getAccessToken("fake_code");

      assert(tokenResponse).toEqual({
        access_token: "fake_access_token",
        token_type: "bearer",
        expires_in: 7200,
        refresh_token: "fake_refresh_token",
      });
    });
  });

  describe(".signInNewUser()", () => {
    it("returns a working token for a completely new user", async () => {
      const ynabClient = new YnabOauthClient({
        clientId: 'fake_client_id',
        clientSecret: 'fake_client_secret',
        redirectUri: 'http://fakehost',
      });
      const db = getFirestore();
      const auth = getAuth();
      // mock oauth call
      nock("https://app.ynab.com")
          .post(/\/oauth\/token\?.*/)
          .reply(200, {
            access_token: "fake_access_token",
            token_type: "bearer",
            expires_in: 7200,
            refresh_token: "fake_refresh_token",
          });
      // mock API call from within the YNAB client
      nock("https://api.ynab.com")
          .get(/\/v1\/user.*/)
          .reply(200, {
            data: {
              user: {
                id: "fake_user_id",
              },
            },
          });

      const token = await ynabClient.signInNewUser("fake_code");
      const snapshot = await db.collection("users").get();

      assert(token.trim() !== "");
      assert(snapshot.docs).toHaveLength(1);
      assert(snapshot.docs[0].data()).toEqual({
        lastToken: {
          access_token: "fake_access_token",
          token_type: "bearer",
          expires_in: 7200,
          refresh_token: "fake_refresh_token",
        },
        ynabUserId: "fake_user_id",
      });

      const user = await auth.getUser(snapshot.docs[0].id);
      assert(user);
    });

    it("returns a working token for an existing user", async () => {
      const ynabClient = new YnabOauthClient({
        clientId: 'fake_client_id',
        clientSecret: 'fake_client_secret',
        redirectUri: 'http://fakehost',
      });
      const db = getFirestore();
      const auth = getAuth();
      // mock oauth call
      nock("https://app.ynab.com")
          .post(/\/oauth\/token\?.*/)
          .reply(200, {
            access_token: "fake_access_token",
            token_type: "bearer",
            expires_in: 7200,
            refresh_token: "fake_refresh_token",
          });
      // mock API call from within the YNAB client
      nock("https://api.ynab.com")
          .get(/\/v1\/user.*/)
          .reply(200, {
            data: {
              user: {
                id: "fake_user_id",
              },
            },
          });
      // and insert an existing user for the mocked YNAB user
      const newUser = await auth.createUser({});
      await db.collection("users").doc(newUser.uid).set({
        ynabUserId: "fake_user_id",
        lastToken: null,
      });

      const token = await ynabClient.signInNewUser("fake_code");
      const snapshot = await db.collection("users").get();

      assert(token.trim() !== "");
      assert(snapshot.docs).toHaveLength(1);
      assert(snapshot.docs[0].id).toEqual(newUser.uid);
      assert(snapshot.docs[0].data()).toEqual({
        lastToken: {
          access_token: "fake_access_token",
          token_type: "bearer",
          expires_in: 7200,
          refresh_token: "fake_refresh_token",
        },
        ynabUserId: "fake_user_id",
      });
    });
  });
});
