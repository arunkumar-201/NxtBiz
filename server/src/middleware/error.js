import { env } from "../config/env.js";

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status ?? 500;
  res.status(status).json({
    message: error.message ?? "Internal server error",
    ...(env.nodeEnv === "production" ? {} : { stack: error.stack })
  });
}
