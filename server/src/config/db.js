import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("NxtBiz server started without MONGODB_URI. Database-backed routes require MongoDB.");
    return null;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("NxtBiz MongoDB connected");
  return mongoose.connection;
}
