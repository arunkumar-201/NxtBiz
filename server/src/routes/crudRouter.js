import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createCrudRouter(Model, options = {}) {
  const router = Router();

  router.get("/", asyncHandler(async (_req, res) => {
    const records = await Model.find().sort({ createdAt: -1 }).limit(options.limit ?? 100);
    res.json(records);
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    const record = await Model.findById(req.params.id);
    if (!record) {
      const error = new Error(`${Model.modelName} not found`);
      error.status = 404;
      throw error;
    }
    res.json(record);
  }));

  router.post("/", asyncHandler(async (req, res) => {
    const record = await Model.create(req.body);
    if (options.afterCreate) await options.afterCreate(record, req);
    res.status(201).json(record);
  }));

  router.put("/:id", asyncHandler(async (req, res) => {
    const record = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) {
      const error = new Error(`${Model.modelName} not found`);
      error.status = 404;
      throw error;
    }
    res.json(record);
  }));

  router.delete("/:id", asyncHandler(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }));

  return router;
}
