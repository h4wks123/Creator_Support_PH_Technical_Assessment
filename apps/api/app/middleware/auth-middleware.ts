import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import type { AuthenticatedUser, JwtClaims } from "../types/auth-types.ts";
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
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.sub !== "string"
    ) {
      throw new Error("JWT claims are invalid");
    }

    const claims = decoded as JwtClaims;
    const user: AuthenticatedUser = { userId: claims.sub, email: claims.email };

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
