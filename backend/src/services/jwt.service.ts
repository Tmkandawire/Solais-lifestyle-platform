import { SignJWT, jwtVerify, errors as joseErrors, type JWTPayload } from 'jose';

import { Role } from '../generated/prisma/enums.js';
import {
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
  type TokenErrorReason,
} from '../shared/errors/jwt.errors.js';
import { env } from '../config/env.js';

const ACCESS_TOKEN_TYPE = 'access' as const;
const REFRESH_TOKEN_TYPE = 'refresh' as const;

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

const VALID_ROLES = new Set(Object.values(Role));

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  sessionId: string;
  role: Role;
  tokenType: typeof ACCESS_TOKEN_TYPE;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  sessionId: string;
  tokenType: typeof REFRESH_TOKEN_TYPE;
}

function isAccessTokenPayload(payload: JWTPayload): payload is AccessTokenPayload {
  return (
    typeof payload.sub === 'string' &&
    payload.sub.length > 0 &&
    typeof payload.sessionId === 'string' &&
    payload.sessionId.length > 0 &&
    typeof payload.role === 'string' &&
    VALID_ROLES.has(payload.role as Role) &&
    payload.tokenType === ACCESS_TOKEN_TYPE
  );
}

function isRefreshTokenPayload(payload: JWTPayload): payload is RefreshTokenPayload {
  return (
    typeof payload.sub === 'string' &&
    payload.sub.length > 0 &&
    typeof payload.sessionId === 'string' &&
    payload.sessionId.length > 0 &&
    payload.tokenType === REFRESH_TOKEN_TYPE
  );
}

function getTokenErrorReason(error: unknown): TokenErrorReason {
  if (error instanceof joseErrors.JWTExpired) {
    return 'expired';
  }

  if (error instanceof joseErrors.JWSSignatureVerificationFailed) {
    return 'invalid-signature';
  }

  if (error instanceof joseErrors.JWTInvalid || error instanceof joseErrors.JOSEError) {
    return 'malformed';
  }

  return 'malformed';
}

/**
 * Generates a signed access token.
 */
export async function generateAccessToken(
  accountId: string,
  sessionId: string,
  role: Role,
): Promise<string> {
  return new SignJWT({
    sessionId,
    role,
    tokenType: ACCESS_TOKEN_TYPE,
  })
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setSubject(accountId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET);
}

/**
 * Verifies an access token and returns its validated payload.
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      clockTolerance: '5s',
    });

    if (!isAccessTokenPayload(payload)) {
      throw new InvalidAccessTokenError('malformed');
    }

    return payload;
  } catch (error) {
    if (error instanceof InvalidAccessTokenError) {
      throw error;
    }

    throw new InvalidAccessTokenError(getTokenErrorReason(error));
  }
}

/**
 * Generates a signed refresh token.
 */
export async function generateRefreshToken(accountId: string, sessionId: string): Promise<string> {
  return new SignJWT({
    sessionId,
    tokenType: REFRESH_TOKEN_TYPE,
  })
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setSubject(accountId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET);
}

/**
 * Verifies a refresh token and returns its validated payload.
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      clockTolerance: '5s',
    });

    if (!isRefreshTokenPayload(payload)) {
      throw new InvalidRefreshTokenError('malformed');
    }

    return payload;
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      throw error;
    }

    throw new InvalidRefreshTokenError(getTokenErrorReason(error));
  }
}
