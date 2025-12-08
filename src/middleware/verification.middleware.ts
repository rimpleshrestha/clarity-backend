import type { NextFunction, Request, Response } from "express";
import { decodeJWT } from "../../lib/jwt.js";
import { TokenExpiredError } from "jsonwebtoken";

const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed token" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Couldn't find the token in header",
    });
  }
  try {
    const decodedToken = decodeJWT(token);
    req.user = decodedToken.payload.user_id;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(403).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authorizeUser;
