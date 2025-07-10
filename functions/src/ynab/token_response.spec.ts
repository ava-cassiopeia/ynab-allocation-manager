import * as assert from "assert";
import {tokenResponseToSchema} from "./token_response";
import {TokenResponse} from "./models";

describe("tokenResponseToSchema", () => {
  it("should correctly map TokenResponse to TokenSchema and calculate expires_at", () => {
    const now = new Date();
    const expiresIn = 3600; // 1 hour in seconds
    const tokenResponse: TokenResponse = {
      access_token: "test_access_token",
      token_type: "bearer",
      expires_in: expiresIn,
      refresh_token: "test_refresh_token",
    };

    const expectedExpiresAt = now.getTime() + expiresIn * 1000;

    const tokenSchema = tokenResponseToSchema(tokenResponse);

    assert.strictEqual(tokenSchema.access_token, tokenResponse.access_token);
    assert.strictEqual(tokenSchema.token_type, tokenResponse.token_type);
    assert.strictEqual(tokenSchema.refresh_token, tokenResponse.refresh_token);
    // Check if expires_at is within a small delta to account for execution time
    assert.ok(tokenSchema.expires_at >= expectedExpiresAt);
    assert.ok(tokenSchema.expires_at <= expectedExpiresAt + 1000); // Allow 1s delta
  });

  it("should handle expires_in being 0", () => {
    const now = new Date();
    const expiresIn = 0;
    const tokenResponse: TokenResponse = {
      access_token: "test_access_token_zero_expiry",
      token_type: "bearer",
      expires_in: expiresIn,
      refresh_token: "test_refresh_token_zero_expiry",
    };

    const expectedExpiresAt = now.getTime();
    const tokenSchema = tokenResponseToSchema(tokenResponse);

    assert.strictEqual(tokenSchema.access_token, tokenResponse.access_token);
    assert.strictEqual(tokenSchema.token_type, tokenResponse.token_type);
    assert.strictEqual(tokenSchema.refresh_token, tokenResponse.refresh_token);
    assert.ok(tokenSchema.expires_at >= expectedExpiresAt);
    assert.ok(tokenSchema.expires_at <= expectedExpiresAt + 1000); // Allow 1s delta
  });
});
