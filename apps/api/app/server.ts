import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth-route.ts";
import formRoutes from "./routes/form-route.ts";
import publicFormRoutes from "./routes/public-form-route.ts";
import questionRoutes from "./routes/question-route.ts";
import responseRoutes from "./routes/response-route.ts";
import webhookRoutes from "./routes/webhook-route.ts";
import { env } from "./config/env.ts";
import { logger } from "./utils/logger.ts";

const app = express();
const corsOption = {
  origin: env.corsOrigin,
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/forms", questionRoutes);
app.use("/api/forms", responseRoutes);
app.use("/api/forms", webhookRoutes);
app.use("/api/public/forms", publicFormRoutes);

const server = app.listen(env.apiPort, () => {
  logger.info({ port: env.apiPort }, "Forms API listening");
});

server.on("error", (err) => {
  logger.error({ error: err }, `Server failed to start`);
});
