import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.ts";
import authRoutes from "./routes/auth-route.ts";
import formRoutes from "./routes/form-route.ts";
import questionRoutes from "./routes/question-route.ts";
import publicFormRoutes from "./routes/public-form-route.ts";
import responseRoutes from "./routes/response-route.ts";
import webhookRoutes from "./routes/webhook-route.ts";

const app = express();
const port = 5000;
const corsOption = {
  origin: "http://localhost:3000",
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

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});

server.on("error", (err) => {
  logger.error({ error: err }, `Server failed to start`);
});
