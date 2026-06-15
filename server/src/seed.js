import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db.js";
import { agentDefinitions } from "./constants/spec.js";
import { User } from "./models/User.js";
import { Customer } from "./models/Customer.js";
import { Agent, Workflow } from "./models/Operations.js";

await connectDatabase();

await User.findOneAndUpdate(
  { email: "admin@nxtbiz.local" },
  {
    name: "NxtBiz Admin",
    email: "admin@nxtbiz.local",
    role: "Admin",
    active: true,
    passwordHash: await bcrypt.hash("Admin12345", 12)
  },
  { upsert: true, new: true }
);

const customer = await Customer.findOneAndUpdate(
  { email: "alex@example.com" },
  {
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "+1 555 0100",
    company: "Brightline Studio",
    tags: ["sample", "priority"],
    notes: "Sample customer for NxtBiz validation.",
    healthScore: 82
  },
  { upsert: true, new: true }
);

await Workflow.findOneAndUpdate(
  { name: "Negative Email Escalation" },
  {
    name: "Negative Email Escalation",
    trigger: "email.processed",
    condition: "negative",
    action: "create ticket and notify manager",
    steps: [
      { type: "trigger", label: "Email processed" },
      { type: "condition", label: "Sentiment is negative" },
      { type: "action", label: "Create ticket and notify manager" }
    ],
    enabled: true,
    logs: []
  },
  { upsert: true }
);

for (const agentId of agentDefinitions) {
  await Agent.findOneAndUpdate(
    { agentId },
    { agentId, name: agentId.replaceAll("-", " "), status: "idle", capabilities: ["operations", "crm"] },
    { upsert: true }
  );
}

console.log(`Seeded NxtBiz admin, sample customer ${customer.email}, workflow, and agents.`);
process.exit(0);
