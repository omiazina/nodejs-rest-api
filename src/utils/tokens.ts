import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function createAccessToken(userId: number) {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function createRefreshToken(userId: number) {
  return jwt.sign({ sub: userId, jti: randomUUID() }, getJwtSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
}
