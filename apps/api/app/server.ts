import express from "express";
import cors from "cors";
import { pino } from "pino";
import { pool } from "./config/psql-db.ts";

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
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Database connected! Current time from DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});

server.on("error", (err) => {
  logger.error(`Server failed to start: ${err}`);
});
