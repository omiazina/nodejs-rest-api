import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
  sub: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    const sub = Number(payload.sub);

    if (!Number.isInteger(sub) || sub <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { sub };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
