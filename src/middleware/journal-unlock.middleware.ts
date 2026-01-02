import type { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../../lib/jwt.js";

export const verifyUnlockToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["x-unlock-token"] ?? req.headers["unlock-token"];
  if (!token || typeof token !== "string") {
    return res.status(401).json({ message: "Unlock token required" });
  }
  try {
    const decoded = verifyJWT(token) as { user_id: number };
    req.unlock = {
      user_id: decoded.user_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired unlock token" });
  }
};
