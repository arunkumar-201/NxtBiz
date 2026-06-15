import IORedis from "ioredis";
import { env } from "./env.js";

let warnedAboutMissingRedis = false;

export function isRedisConfigured() {
  return Boolean(env.redisUrl);
}

export function warnRedisFallback() {
  if (warnedAboutMissingRedis) return;
  warnedAboutMissingRedis = true;
  console.warn("REDIS_URL is not configured. NxtBiz agent orchestration will run synchronously.");
}

export function createRedisConnection() {
  if (!env.redisUrl) return null;

  return new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    connectTimeout: 5000,
    retryStrategy: () => null
  });
}
