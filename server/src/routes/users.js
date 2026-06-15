import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usersRouter = Router();

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["Admin", "Manager", "Employee", "Viewer"]),
  active: z.boolean().optional()
});

usersRouter.get("/", requireRole("Admin", "Manager"), asyncHandler(async (_req, res) => {
  const users = await User.find().select("-passwordHash -refreshTokenHash").sort({ createdAt: -1 });
  res.json(users);
}));

usersRouter.post("/", requireRole("Admin"), asyncHandler(async (req, res) => {
  const body = userSchema.extend({ password: z.string().min(8) }).parse(req.body);
  const user = await User.create({ ...body, passwordHash: await bcrypt.hash(body.password, 12) });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
}));

usersRouter.put("/:id", requireRole("Admin", "Manager"), asyncHandler(async (req, res) => {
  const body = userSchema.partial().parse(req.body);
  const update = { ...body };
  if (body.password) {
    update.passwordHash = await bcrypt.hash(body.password, 12);
    delete update.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash -refreshTokenHash");
  res.json(user);
}));

usersRouter.delete("/:id", requireRole("Admin"), asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
}));
