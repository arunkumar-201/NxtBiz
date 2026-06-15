import mongoose from "mongoose";

const objectId = mongoose.Schema.Types.ObjectId;

export const Meeting = mongoose.model("Meeting", new mongoose.Schema({
  title: { type: String, required: true },
  attendees: [String],
  startTime: Date,
  endTime: Date,
  notes: String,
  status: { type: String, default: "scheduled" },
  customerId: { type: objectId, ref: "Customer" }
}, { timestamps: true }));

export const Invoice = mongoose.model("Invoice", new mongoose.Schema({
  customerId: { type: objectId, ref: "Customer" },
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, default: "draft" },
  pdfUrl: String,
  lineItems: [mongoose.Schema.Types.Mixed]
}, { timestamps: true }));

export const Report = mongoose.model("Report", new mongoose.Schema({
  type: String,
  title: { type: String, required: true },
  metrics: mongoose.Schema.Types.Mixed,
  recommendations: [String],
  summary: String,
  pdfUrl: String,
  generatedBy: { type: objectId, ref: "User" }
}, { timestamps: true }));

export const Ticket = mongoose.model("Ticket", new mongoose.Schema({
  customerId: { type: objectId, ref: "Customer" },
  priority: { type: String, default: "medium" },
  issue: { type: String, required: true },
  status: { type: String, default: "open" },
  assignedTo: { type: objectId, ref: "User" },
  resolution: String
}, { timestamps: true }));

export const Agent = mongoose.model("Agent", new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, default: "idle" },
  lastExecution: Date,
  logs: [String],
  capabilities: [String]
}, { timestamps: true }));

export const AgentExecution = mongoose.model("AgentExecution", new mongoose.Schema({
  agentId: String,
  eventId: String,
  status: { type: String, default: "queued" },
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  logs: [String],
  startedAt: Date,
  finishedAt: Date,
  error: String
}, { timestamps: true }));

export const Workflow = mongoose.model("Workflow", new mongoose.Schema({
  name: { type: String, required: true },
  trigger: String,
  condition: String,
  action: String,
  steps: [{ type: { type: String, enum: ["trigger", "condition", "action"] }, label: String, config: mongoose.Schema.Types.Mixed }],
  enabled: { type: Boolean, default: true },
  logs: [mongoose.Schema.Types.Mixed]
}, { timestamps: true }));

export const Notification = mongoose.model("Notification", new mongoose.Schema({
  userId: { type: objectId, ref: "User" },
  type: String,
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true }));

export const Memory = mongoose.model("Memory", new mongoose.Schema({
  scope: String,
  customerId: { type: objectId, ref: "Customer" },
  agentId: String,
  key: String,
  value: String,
  tags: [String],
  source: String
}, { timestamps: true }));

export const CRMActivity = mongoose.model("CRMActivity", new mongoose.Schema({
  customerId: { type: objectId, ref: "Customer" },
  type: String,
  title: String,
  body: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdBy: { type: objectId, ref: "User" }
}, { timestamps: true }));
