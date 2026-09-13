import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../utils/util.ts";
import {
  authenticatedUserSchema,
  jwtClaimsSchema,
} from "../types/auth-types.ts";
import { logger } from "../utils/logger.ts";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error(
      { path: req.path, method: req.method },
      "Missing bearer token",
    );
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    if (!token) {
      throw new Error("JWT verification is unavailable");
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const claims = jwtClaimsSchema.safeParse(decoded);
    if (!claims.success) throw new Error("JWT claims are invalid");

    const user = authenticatedUserSchema.parse({
      userId: claims.data.sub,
      email: claims.data.email,
    });

    res.locals.user = user;

    logger.info(
      { userId: user.userId, path: req.path, method: req.method },
      "JWT verified",
    );

    next();
  } catch (err) {
    logger.error(
      { error: err, path: req.path, method: req.method },
      "JWT verification failed",
    );

    return res.status(401).json({ message: "Unauthorized" });
  }
};
