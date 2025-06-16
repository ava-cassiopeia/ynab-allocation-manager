import {TokenResponse, TokenSchema} from "./models";

export function tokenResponseToSchema(response: TokenResponse): TokenSchema {
  const ttlMs = response.expires_in * 1000; // convert seconds to millis
  const now = new Date();

  return {
    access_token: response.access_token,
    token_type: response.token_type,
    expires_at: now.getTime() + ttlMs,
    refresh_token: response.refresh_token,
  };
}
