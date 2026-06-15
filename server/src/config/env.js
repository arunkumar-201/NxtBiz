import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  pdfBaseUrl: process.env.PDF_BASE_URL ?? "http://localhost:8000/pdfs",
  emailFrom: process.env.EMAIL_FROM ?? "operations@nxtbiz.local"
};

export function assertProductionSecrets() {
  if (env.nodeEnv !== "production") return;
  const missing = [];
  if (!env.mongoUri) missing.push("MONGODB_URI");
  if (!process.env.JWT_ACCESS_SECRET) missing.push("JWT_ACCESS_SECRET");
  if (!process.env.JWT_REFRESH_SECRET) missing.push("JWT_REFRESH_SECRET");
  if (missing.length) {
    throw new Error(`Missing required production variables: ${missing.join(", ")}`);
  }
}
