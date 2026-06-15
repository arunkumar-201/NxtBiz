import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

function getToken(req) {
  const header = req.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.accessToken;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");
    if (!user || !user.active) {
      const error = new Error("Invalid authenticated user");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.status = error.status ?? 401;
    next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const error = new Error("Insufficient permissions");
      error.status = 403;
      next(error);
      return;
    }
    next();
  };
}
