import { Pool } from "pg";
import { env } from "../utils/util.ts";

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});
