export const roles = ["Admin", "Manager", "Employee", "Viewer"];

export const socketEvents = [
  "new_email",
  "new_ticket",
  "invoice_created",
  "meeting_created",
  "agent_completed",
  "workflow_executed"
];

export const healthScoreWeights = {
  customerSatisfaction: 0.28,
  responseTime: 0.16,
  invoiceCollection: 0.2,
  ticketResolution: 0.2,
  leadConversion: 0.16
};

export const agentDefinitions = [
  "intent-agent",
  "task-planner-agent",
  "email-agent",
  "crm-agent",
  "meeting-agent",
  "invoice-agent",
  "customer-support-agent",
  "chief-of-staff-agent"
];

export const intentToAgent = {
  schedule_meeting: "meeting-agent",
  invoice_request: "invoice-agent",
  support_request: "customer-support-agent",
  sales_opportunity: "email-agent"
};
