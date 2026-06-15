import { Router } from "express";
import { Customer } from "../models/Customer.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(async (_req, res) => {
  res.json(await Customer.find().sort({ createdAt: -1 }));
}));

customersRouter.get("/:id", asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    const error = new Error("Customer not found");
    error.status = 404;
    throw error;
  }
  res.json(customer);
}));

customersRouter.post("/", asyncHandler(async (req, res) => {
  res.status(201).json(await Customer.create(req.body));
}));

customersRouter.put("/:id", asyncHandler(async (req, res) => {
  res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }));
}));

customersRouter.delete("/:id", requireRole("Admin", "Manager"), asyncHandler(async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.status(204).send();
}));
