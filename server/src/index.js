import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { registerSocket } from "./config/socket.js";
import { connectDatabase } from "./config/db.js";
import { assertProductionSecrets, env } from "./config/env.js";
import { startAgentWorker } from "./workers/agentWorker.js";

assertProductionSecrets();
await connectDatabase();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true }
});

io.on("connection", (socket) => {
  socket.emit("connected", { service: "NxtBiz realtime" });
});
registerSocket(io);
startAgentWorker();

server.listen(env.port, () => {
  console.log(`NxtBiz API listening on ${env.port}`);
});
