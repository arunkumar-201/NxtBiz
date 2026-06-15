import { Router } from "express";
import { emitEvent } from "../config/socket.js";
import { Customer } from "../models/Customer.js";
import { Agent, AgentExecution, CRMActivity, Invoice, Memory, Meeting, Notification, Report, Ticket, Workflow } from "../models/Operations.js";
import { createInvoicePdf, createReportPdf } from "../services/pdfService.js";
import { enqueueOrRunAgentOrchestration } from "../queues/agentQueue.js";
import { executeWorkflow } from "../services/workflowService.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudRouter } from "./crudRouter.js";

export const crmRouter = Router();
crmRouter.get("/", asyncHandler(async (_req, res) => res.json(await CRMActivity.find().sort({ createdAt: -1 }).limit(100))));
crmRouter.post("/note", asyncHandler(async (req, res) => {
  const activity = await CRMActivity.create({ ...req.body, type: "note", createdBy: req.user._id });
  res.status(201).json(activity);
}));
crmRouter.post("/activity", asyncHandler(async (req, res) => {
  const activity = await CRMActivity.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(activity);
}));

export const meetingsRouter = createCrudRouter(Meeting, {
  afterCreate: (record) => emitEvent("meeting_created", { meetingId: record._id })
});

export const invoicesRouter = Router();
invoicesRouter.get("/", asyncHandler(async (_req, res) => res.json(await Invoice.find().sort({ createdAt: -1 }))));
invoicesRouter.post("/", asyncHandler(async (req, res) => {
  const invoice = await Invoice.create(req.body);
  const customer = invoice.customerId ? await Customer.findById(invoice.customerId) : null;
  invoice.pdfUrl = createInvoicePdf(invoice, customer);
  await invoice.save();
  emitEvent("invoice_created", { invoiceId: invoice._id });
  res.status(201).json(invoice);
}));
invoicesRouter.get("/:id", asyncHandler(async (req, res) => res.json(await Invoice.findById(req.params.id))));
invoicesRouter.get("/:id/download", asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice?.pdfUrl) {
    const error = new Error("Invoice PDF not found");
    error.status = 404;
    throw error;
  }
  res.redirect(invoice.pdfUrl);
}));
invoicesRouter.put("/:id", asyncHandler(async (req, res) => res.json(await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
invoicesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.status(204).send();
}));

export const ticketsRouter = createCrudRouter(Ticket, {
  afterCreate: (record) => emitEvent("new_ticket", { ticketId: record._id })
});

export const reportsRouter = Router();
reportsRouter.post("/generate", asyncHandler(async (req, res) => {
  const report = await Report.create({ ...req.body, generatedBy: req.user._id });
  report.pdfUrl = createReportPdf(report);
  await report.save();
  res.status(201).json(report);
}));
reportsRouter.get("/", asyncHandler(async (_req, res) => res.json(await Report.find().sort({ createdAt: -1 }))));
reportsRouter.get("/:id", asyncHandler(async (req, res) => res.json(await Report.findById(req.params.id))));

export const agentsRouter = Router();
agentsRouter.get("/", asyncHandler(async (_req, res) => res.json(await Agent.find().sort({ agentId: 1 }))));
agentsRouter.get("/executions", asyncHandler(async (_req, res) => res.json(await AgentExecution.find().sort({ createdAt: -1 }).limit(100))));
agentsRouter.post("/run", requireRole("Admin", "Manager"), asyncHandler(async (req, res) => {
  res.status(202).json(await enqueueOrRunAgentOrchestration(req.body));
}));

export const workflowsRouter = createCrudRouter(Workflow);
workflowsRouter.post("/:id/execute", asyncHandler(async (req, res) => res.json(await executeWorkflow(req.params.id, req.body))));

export const memoryRouter = Router();
memoryRouter.get("/search", asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "");
  const records = await Memory.find(q ? {
    $or: [
      { key: { $regex: q, $options: "i" } },
      { value: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } }
    ]
  } : {}).limit(50);
  res.json(records);
}));

export const notificationsRouter = Router();
notificationsRouter.get("/", asyncHandler(async (req, res) => {
  const query = { $or: [{ userId: req.user._id }, { userId: { $exists: false } }] };
  res.json(await Notification.find(query).sort({ createdAt: -1 }).limit(100));
}));
notificationsRouter.put("/:id", asyncHandler(async (req, res) => {
  res.json(await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true }));
}));
