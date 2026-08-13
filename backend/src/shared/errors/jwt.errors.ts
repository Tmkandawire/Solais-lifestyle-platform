export type TokenErrorReason = 'expired' | 'invalid-signature' | 'malformed';

export class InvalidAccessTokenError extends Error {
  public readonly reason: TokenErrorReason;

  constructor(reason: TokenErrorReason) {
    super(`Invalid access token: ${reason}.`);
    this.name = 'InvalidAccessTokenError';
    this.reason = reason;
  }
}

export class InvalidRefreshTokenError extends Error {
  public readonly reason: TokenErrorReason;

  constructor(reason: TokenErrorReason) {
    super(`Invalid refresh token: ${reason}.`);
    this.name = 'InvalidRefreshTokenError';
    this.reason = reason;
  }
}
