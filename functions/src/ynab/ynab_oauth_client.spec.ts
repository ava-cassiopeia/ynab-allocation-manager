import nock from "nock";
import assert from "expect";
import sinon from "sinon";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {DecodedIdToken, getAuth} from "firebase-admin/auth";

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

  // Clean up any created users
  afterEach(async () => {
    const auth = getAuth();
    const users = await auth.listUsers(10);
    await auth.deleteUsers(users.users.map((u) => u.uid));
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
      const data = snapshot.docs[0].data();
      assert(data.lastToken.access_token).toEqual("fake_access_token");
      assert(data.lastToken.token_type).toEqual("bearer");
      assert(data.lastToken.refresh_token).toEqual("fake_refresh_token");
      assert(data.ynabUserId).toEqual("fake_user_id");

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
      const data = snapshot.docs[0].data();
      assert(data.lastToken.access_token).toEqual("fake_access_token");
      assert(data.lastToken.token_type).toEqual("bearer");
      assert(data.lastToken.refresh_token).toEqual("fake_refresh_token");
      assert(data.ynabUserId).toEqual("fake_user_id");
    });
  });

  describe(".refreshAuthToken()", () => {
    it("successfully refreshes the token", async () => {
      const ynabClient = new YnabOauthClient({
        clientId: 'fake_client_id',
        clientSecret: 'fake_client_secret',
        redirectUri: 'http://fakehost',
      });
      const db = getFirestore();
      const auth = getAuth();
      const user = await auth.createUser({});
      db.collection("users").doc(user.uid).create({
        lastToken: {
          access_token: "fake_access_token",
          token_type: "bearer",
          expires_in: 7200,
          refresh_token: "fake_refresh_token",
        },
      });
      // mock refresh API call
      nock("https://app.ynab.com")
          .post(/\/oauth\/token\?.*/)
          .reply(200, {
            access_token: "super_fake_access_token",
            token_type: "bearer",
            expires_in: 7200,
            refresh_token: "super_fake_refresh_token",
          });
      // Mock verifyIdToken(). Though this is an important part of the
      // the underlying method, the Firebase admin SDK doesn't give us any good
      // tools to generate a valid JWT that we can pass through, so we skip
      // that step for now.
      sinon.stub(auth, "verifyIdToken").resolves({uid: user.uid} as DecodedIdToken);

      const token = await auth.createCustomToken(user.uid);
      const successful = await ynabClient.refreshAuthToken(token);

      assert(successful);
    });
  });
});
