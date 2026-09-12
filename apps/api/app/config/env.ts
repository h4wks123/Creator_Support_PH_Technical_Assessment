import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("../../../../.env", import.meta.url)),
  quiet: true,
});

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const port = (name: string) => {
  const value = Number(required(name));
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
};

const origin = (name: string) => {
  const value = required(name);
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== value) {
    throw new Error(`${name} must be an HTTP(S) origin without a path`);
  }
  return value;
};

export const env = {
  apiPort: port("API_PORT"),
  corsOrigin: origin("CORS_ORIGIN"),
  dbHost: required("DB_HOST"),
  dbPort: port("DB_PORT"),
  dbName: required("DB_NAME"),
  dbUser: required("DB_USER"),
  dbPassword: required("DB_PASS"),
  jwtSecret: required("JWT_SECRET"),
};
