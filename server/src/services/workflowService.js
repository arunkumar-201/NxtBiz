import { Notification, Ticket, Workflow } from "../models/Operations.js";
import { emitEvent } from "../config/socket.js";

export async function executeWorkflow(workflowId, payload) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    const error = new Error("Workflow not found");
    error.status = 404;
    throw error;
  }

  const serialized = JSON.stringify(payload).toLowerCase();
  const condition = workflow.condition?.toLowerCase();
  if (condition && !serialized.includes(condition)) {
    workflow.logs.push({ status: "skipped", reason: "Condition did not match", payload, at: new Date() });
    await workflow.save();
    return workflow;
  }

  if (workflow.action?.toLowerCase().includes("ticket") && payload.customerId) {
    await Ticket.create({
      customerId: payload.customerId,
      priority: payload.priority ?? "high",
      issue: payload.issue ?? "Workflow-created customer follow-up"
    });
    emitEvent("new_ticket", { customerId: payload.customerId });
  }

  if (workflow.action?.toLowerCase().includes("notify")) {
    await Notification.create({
      type: "workflow",
      title: `Workflow executed: ${workflow.name}`,
      message: "NxtBiz completed a workflow action.",
      metadata: payload
    });
  }

  workflow.logs.push({ status: "completed", payload, at: new Date() });
  await workflow.save();
  emitEvent("workflow_executed", { workflowId: workflow._id });
  return workflow;
}
