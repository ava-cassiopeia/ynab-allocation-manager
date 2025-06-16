export interface UserMetadata {
  readonly ynabUserId: string;
  readonly lastToken: TokenSnapshot;
}

export interface TokenSnapshot {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_at: number;
  readonly refresh_token: string;
}
