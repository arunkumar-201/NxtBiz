import { pathToFileURL } from "url";
import { Worker } from "bullmq";
import { connectDatabase } from "../config/db.js";
import { createRedisConnection, isRedisConfigured, warnRedisFallback } from "../config/redis.js";
import { assertProductionSecrets } from "../config/env.js";
import { runAgentOrchestration } from "../services/agentOrchestration.js";
import { AGENT_ORCHESTRATION_QUEUE } from "../queues/agentQueue.js";

export function startAgentWorker() {
  if (!isRedisConfigured()) {
    warnRedisFallback();
    return null;
  }

  const worker = new Worker(
    AGENT_ORCHESTRATION_QUEUE,
    async (job) => runAgentOrchestration(job.data),
    {
      connection: createRedisConnection(),
      concurrency: 4
    }
  );

  worker.on("completed", (job) => {
    console.log(`NxtBiz agent orchestration job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`NxtBiz agent orchestration job failed: ${job?.id}`, error);
  });

  return worker;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assertProductionSecrets();
  await connectDatabase();
  const worker = startAgentWorker();
  if (worker) {
    console.log("NxtBiz agent worker listening for orchestration jobs.");
  }
}
