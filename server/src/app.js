import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { customersRouter } from "./routes/customers.js";
import { emailsRouter } from "./routes/emails.js";
import {
  agentsRouter,
  crmRouter,
  invoicesRouter,
  meetingsRouter,
  memoryRouter,
  notificationsRouter,
  reportsRouter,
  ticketsRouter,
  workflowsRouter
} from "./routes/operations.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/pdfs", express.static(path.resolve("storage", "pdfs")));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "NxtBiz API" }));
  app.use("/api/auth", authRouter);

  app.use("/api/users", requireAuth, usersRouter);
  app.use("/api/dashboard", requireAuth, dashboardRouter);
  app.use("/api/customers", requireAuth, customersRouter);
  app.use("/api/emails", requireAuth, emailsRouter);
  app.use("/api/crm", requireAuth, crmRouter);
  app.use("/api/meetings", requireAuth, meetingsRouter);
  app.use("/api/invoices", requireAuth, invoicesRouter);
  app.use("/api/tickets", requireAuth, ticketsRouter);
  app.use("/api/reports", requireAuth, reportsRouter);
  app.use("/api/agents", requireAuth, agentsRouter);
  app.use("/api/workflows", requireAuth, workflowsRouter);
  app.use("/api/memory", requireAuth, memoryRouter);
  app.use("/api/notifications", requireAuth, notificationsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
