import express from "express";
import cors from "cors";
import { pino } from "pino";

const app = express();
const port = 5000;
const corsOption = {
  origin: "http://localhost:5000",
  credentials: true,
};

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

app.use(cors(corsOption));

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});

server.on("error", (err) => {
  logger.error(`Server failed to start: ${err}`);
});