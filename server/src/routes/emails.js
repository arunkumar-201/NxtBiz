import { Router } from "express";
import { z } from "zod";
import { emitEvent } from "../config/socket.js";
import { Email } from "../models/Email.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeEmail } from "../services/emailIntelligence.js";
import { enqueueOrRunAgentOrchestration } from "../queues/agentQueue.js";

export const emailsRouter = Router();

const processSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  sender: z.string().email(),
  customerId: z.string().optional()
});

emailsRouter.post("/process", asyncHandler(async (req, res) => {
  const body = processSchema.parse(req.body);
  const analysis = analyzeEmail(body);
  const email = await Email.create({ ...body, ...analysis });
  emitEvent("new_email", { emailId: email._id, urgency: email.urgency });
  const orchestration = await enqueueOrRunAgentOrchestration({ emailId: email._id, intent: email.intent, analysis });
  res.status(201).json({ email, analysis, orchestration: { eventId: orchestration.eventId, agents: orchestration.agents } });
}));

emailsRouter.get("/", asyncHandler(async (_req, res) => {
  res.json(await Email.find().sort({ createdAt: -1 }));
}));

emailsRouter.get("/:id", asyncHandler(async (req, res) => {
  const email = await Email.findById(req.params.id);
  if (!email) {
    const error = new Error("Email not found");
    error.status = 404;
    throw error;
  }
  res.json(email);
}));
