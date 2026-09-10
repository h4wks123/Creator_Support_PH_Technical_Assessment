import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.ts";
import authRoutes from "./routes/auth-route.ts";

const app = express();
const port = 5000;
const corsOption = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());

app.use("/api/auth", authRoutes);

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});

server.on("error", (err) => {
  logger.error({ error: err }, `Server failed to start`);
});
