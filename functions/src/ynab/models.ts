export interface TokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number; // In seconds
  readonly refresh_token: string;
}

export interface TokenSchema {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_at: number; // in milliseconds
  readonly refresh_token: string;
}
