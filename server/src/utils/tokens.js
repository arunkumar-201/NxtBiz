import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign({ role: user.role, email: user.email }, env.jwtAccessSecret, {
    subject: String(user._id),
    expiresIn: env.accessTokenExpiresIn
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ tokenVersion: Date.now() }, env.jwtRefreshSecret, {
    subject: String(user._id),
    expiresIn: env.refreshTokenExpiresIn
  });
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production"
  };
}
