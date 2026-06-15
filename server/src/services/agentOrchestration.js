import { randomUUID } from "crypto";
import { Email } from "../models/Email.js";
import { AgentExecution, Notification } from "../models/Operations.js";
import { emitEvent } from "../config/socket.js";
import { agentDefinitions, intentToAgent } from "../constants/spec.js";

export function planAgents(intent) {
  const planned = ["intent-agent", "task-planner-agent"];
  if (intentToAgent[intent]) planned.push(intentToAgent[intent]);
  planned.push("crm-agent", "chief-of-staff-agent");
  return [...new Set(planned)];
}

export async function runAgentOrchestration(input) {
  const eventId = input.eventId ?? randomUUID();
  const agents = input.agents ?? planAgents(input.intent);
  const executions = [];

  for (const agentId of agents) {
    const execution = await AgentExecution.create({
      agentId,
      eventId,
      status: "running",
      input,
      logs: [`${agentId} started`],
      startedAt: new Date()
    });

    execution.status = "completed";
    execution.output = {
      summary: `${agentId} completed NxtBiz orchestration step.`,
      knownAgent: agentDefinitions.includes(agentId)
    };
    execution.logs.push(`${agentId} completed`);
    execution.finishedAt = new Date();
    await execution.save();
    executions.push(execution);
  }

  if (input.emailId) {
    await Email.findByIdAndUpdate(input.emailId, { processed: true });
  }

  await Notification.create({
    type: "agent_completed",
    title: "Agent orchestration completed",
    message: "NxtBiz completed the planned operational follow-up.",
    metadata: { eventId, emailId: input.emailId }
  });
  emitEvent("agent_completed", { eventId, emailId: input.emailId });

  return { eventId, agents, executions };
}
