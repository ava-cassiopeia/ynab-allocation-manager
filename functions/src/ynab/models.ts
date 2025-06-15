export interface TokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number; // In seconds
  readonly refresh_token: string;
}
