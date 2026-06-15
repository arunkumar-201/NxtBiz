import { Router } from "express";
import { Customer } from "../models/Customer.js";
import { Email } from "../models/Email.js";
import { AgentExecution, Invoice, Ticket } from "../models/Operations.js";
import { healthScoreWeights } from "../constants/spec.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", asyncHandler(async (_req, res) => {
  const [customers, openTickets, invoices, emails, agentExecutions] = await Promise.all([
    Customer.countDocuments(),
    Ticket.countDocuments({ status: { $ne: "closed" } }),
    Invoice.find().limit(50),
    Email.find().sort({ createdAt: -1 }).limit(5),
    AgentExecution.find().sort({ createdAt: -1 }).limit(8)
  ]);

  const revenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0);
  res.json({
    revenue,
    customers,
    openTickets,
    health: {
      score: 76,
      factors: {
        customerSatisfaction: 80,
        responseTime: 72,
        invoiceCollection: 74,
        leadConversion: 70,
        ticketResolution: 79,
        meetingMomentum: 68
      },
      weights: healthScoreWeights
    },
    recentEmails: emails,
    agentExecutions
  });
}));
