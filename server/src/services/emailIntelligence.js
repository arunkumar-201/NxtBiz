const negativeWords = ["angry", "cancel", "broken", "refund", "late", "complaint", "urgent", "bad", "issue", "failed"];
const positiveWords = ["thanks", "great", "love", "happy", "excellent", "appreciate", "renew"];

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function analyzeEmail({ subject, body }) {
  const text = `${subject} ${body}`.toLowerCase();
  const sentiment = includesAny(text, negativeWords) ? "negative" : includesAny(text, positiveWords) ? "positive" : "neutral";
  const urgency = includesAny(text, ["urgent", "asap", "immediately"]) ? "critical" : sentiment === "negative" ? "high" : "medium";

  let intent = "general_inquiry";
  if (includesAny(text, ["meet", "meeting", "schedule", "calendar"])) intent = "schedule_meeting";
  if (includesAny(text, ["invoice", "billing", "receipt", "payment"])) intent = "invoice_request";
  if (includesAny(text, ["support", "broken", "issue", "failed", "ticket"])) intent = "support_request";
  if (includesAny(text, ["buy", "upgrade", "renew", "proposal", "pricing"])) intent = "sales_opportunity";

  const recommendations = [];
  if (urgency === "critical") recommendations.push("Escalate to a manager immediately.");
  if (intent === "schedule_meeting") recommendations.push("Create a meeting follow-up task.");
  if (intent === "invoice_request") recommendations.push("Review open invoices and send billing details.");
  if (intent === "support_request") recommendations.push("Create or update a support ticket.");
  if (intent === "sales_opportunity") recommendations.push("Log sales opportunity activity in CRM.");

  return {
    sentiment,
    intent,
    urgency,
    confidence: urgency === "critical" || sentiment !== "neutral" ? 0.84 : 0.68,
    autoResponse: "Thanks for contacting NxtBiz operations. Our team is reviewing this and will follow up shortly.",
    recommendations
  };
}
