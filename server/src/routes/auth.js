import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authCookieOptions, hashToken, signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = credentialsSchema.extend({
  name: z.string().min(2),
  role: z.enum(["Admin", "Manager", "Employee", "Viewer"]).optional()
});

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, { ...authCookieOptions(), maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...authCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
}

authRouter.post("/register", asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const user = await User.create({
    name: body.name,
    email: body.email,
    role: body.role ?? "Viewer",
    passwordHash: await bcrypt.hash(body.password, 12)
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ user: publicUser(user), accessToken });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const body = credentialsSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: publicUser(user), accessToken });
}));

authRouter.post("/refresh", asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) {
    const error = new Error("Refresh token required");
    error.status = 401;
    throw error;
  }

  const payload = jwt.verify(token, env.jwtRefreshSecret);
  const user = await User.findById(payload.sub);
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: publicUser(user), accessToken });
}));

authRouter.post("/logout", asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtRefreshSecret);
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: "" } });
    } catch {
      // Logout should clear cookies even if the token is already invalid.
    }
  }
  res.clearCookie("accessToken", authCookieOptions());
  res.clearCookie("refreshToken", authCookieOptions());
  res.status(204).send();
}));
