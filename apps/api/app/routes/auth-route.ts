import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import { pool } from "../config/psql-db.ts";
import { logger } from "../utils/logger.ts";
import { validateEmail, validatePassword } from "../utils/util.ts";

const authRoutes = Router();
const AUTH_ERROR_MESSAGE = "Unable to process authentication request";

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    logger.error(`Email or password payload is missing`);
    return res.status(400).json({ message: AUTH_ERROR_MESSAGE });
  }

  if (!validateEmail(email) || !validatePassword(password)) {
    logger.error(`Invalid login payload format for email: ${email}`);
    return res.status(422).json({ message: AUTH_ERROR_MESSAGE });
  }

  try {
    const result = await pool.query(
      "SELECT user_id, user_email, user_password_hash FROM users WHERE user_email=$1",
      [email],
    );

    const user = result.rows[0];
    const passwordsMatch = user
      ? await bcrypt.compare(password, user.user_password_hash)
      : false;

    if (!passwordsMatch) {
      logger.error(`Password does not match for email: ${email}`);
      return res.status(401).json({ message: AUTH_ERROR_MESSAGE });
    }

    const token = jwt.sign(
      { sub: user.user_id, email: user.user_email },
      env.jwtSecret,
      { expiresIn: "1d" },
    );

    logger.info("Successfully signed in user");
    return res.status(200).json({ token });
  } catch (err) {
    logger.error({ error: err }, "Failed to sign in user");
    return res.status(400).json({ message: AUTH_ERROR_MESSAGE });
  }
});

authRoutes.post("/register", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    logger.error(`Email or password payload is missing`);
    return res.status(400).json({ message: AUTH_ERROR_MESSAGE });
  }

  if (!validateEmail(email) || !validatePassword(password)) {
    logger.error(`Invalid registration payload format for email: ${email}`);
    return res.status(422).json({ message: AUTH_ERROR_MESSAGE });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = email.split("@")[0];

    const result = await pool.query(
      `INSERT INTO users (user_id, user_name, user_email, user_password_hash)
       VALUES ($1, $2, $3, $4)
      RETURNING user_id, user_name, user_email, user_created_at`,
      [crypto.randomUUID(), userName, email, hashedPassword],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { sub: user.user_id, email: user.user_email },
      env.jwtSecret,
      { expiresIn: "1d" },
    );

    logger.info("Successfully registered user");
    return res.status(201).json({ user, token });
  } catch (err) {
    logger.error({ error: err }, "Failed to register user");
    return res.status(400).json({ message: AUTH_ERROR_MESSAGE });
  }
});

export default authRoutes;
