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
const ALLOWED_ORIGINS = [
  "https://yam.ynab.rocks",
  "http://localhost:5002",
];

export const oauthLogIn = onRequest(
    {
      secrets: ["YNAB_CLIENT_ID", "YNAB_CLIENT_SECRET"],
    },
    async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const oauthClient = new YnabOauthClient({
    clientId: clientId.value(),
    clientSecret: clientSecret.value(),
    redirectUri: redirectUri.value(),
  });
  const code = req.body.data?.code ?? null;

  if (code === null || code.trim() === "") {
    logger.warn("Bad request to oauthLogIn(): no code was provided.");
    res.status(400).json({
      error: true,
      message: "Bad request: no code provided.",
      body: req.body,
    });
    return;
  }

  const token = await oauthClient.signInNewUser(code);
  logger.info("Successfully signed in YNAB user.");
  res.json({
    data: {
      token,
    },
  });
});

export const refreshYnabToken = onRequest(
    {
      secrets: ["YNAB_CLIENT_ID", "YNAB_CLIENT_SECRET"],
    },
    async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const oauthClient = new YnabOauthClient({
    clientId: clientId.value(),
    clientSecret: clientSecret.value(),
    redirectUri: redirectUri.value(),
  });
  const refreshToken = req.body.data?.refreshToken ?? null;

  if (refreshToken === null || refreshToken.trim() === "") {
    logger.warn("Bad request to refreshYnabToken(): no token was provided.");
    res.status(400).json({
      error: true,
      message: "Bad request: no token provided.",
      body: req.body,
    });
    return;
  }

  const success = await oauthClient.refreshAuthToken(refreshToken);
  if (success) {
    logger.info("Successfully refreshed user auth token.");
  } else {
    logger.info("Unsuccessfully refreshed user auth token.");
  }
  res.json({
    data: {
      success,
    },
  });
});
