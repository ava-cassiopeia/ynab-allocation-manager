import "dotenv/config";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {defineSecret, defineString} from "firebase-functions/params";
import {YnabOauthClient} from "./ynab/ynab_oauth_client";

initializeApp();

const clientId = defineSecret("YNAB_CLIENT_ID");
const clientSecret = defineSecret("YNAB_CLIENT_SECRET");
const redirectUri = defineString("YNAB_CALLBACK_URL");

export const oauthLogIn = onRequest(
    {
      secrets: ["YNAB_CLIENT_ID", "YNAB_CLIENT_SECRET"],
    },
    async (req, res) => {
  const oauthClient = new YnabOauthClient({
    clientId: clientId.value(),
    clientSecret: clientSecret.value(),
    redirectUri: redirectUri.value(),
  });
  const code = req.params["code"] ?? null;

  if (code === null || code.trim() === "") {
    logger.warn("Bad request to oauthLogIn(): no code was provided.");
    res.status(400).json({
      error: true,
      message: "Bad request: no code provided.",
    });
    return;
  }

  const token = await oauthClient.signInNewUser(code);
  logger.info("Successfully signed in YNAB user.");
  res.json({
    token,
  });
});
