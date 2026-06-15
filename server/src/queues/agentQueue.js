import { randomUUID } from "crypto";
import { Queue } from "bullmq";
import { createRedisConnection, isRedisConfigured, warnRedisFallback } from "../config/redis.js";
import { planAgents, runAgentOrchestration } from "../services/agentOrchestration.js";

export const AGENT_ORCHESTRATION_QUEUE = "agent-orchestration";

let agentQueue;

function getAgentQueue() {
  if (!agentQueue) {
    agentQueue = new Queue(AGENT_ORCHESTRATION_QUEUE, {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: true
      }
    });
  }

  return agentQueue;
}

export async function enqueueOrRunAgentOrchestration(input) {
  const eventId = input.eventId ?? randomUUID();
  const agents = input.agents ?? planAgents(input.intent);
  const payload = { ...input, eventId, agents };

  if (!isRedisConfigured()) {
    warnRedisFallback();
    return runAgentOrchestration(payload);
  }

  try {
    const queue = getAgentQueue();
    await queue.waitUntilReady();
    const job = await queue.add("run-agent-orchestration", payload);
    return {
      eventId,
      agents,
      queued: true,
      jobId: job.id
    };
  } catch (error) {
    console.warn(`Failed to enqueue agent orchestration job. Falling back to synchronous execution: ${error.message}`);
    return runAgentOrchestration(payload);
  }
}
