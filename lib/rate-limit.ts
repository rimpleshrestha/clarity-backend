import type { NextFunction, Request, Response } from "express";
import type { Options } from "express-rate-limit";

const rateLimitOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000, //15 min
  message: "Too many Request",
  statusCode: 429,
  limit: 100,
  legacyHeaders: false,
  standardHeaders: true,
  handler: (req: Request, res: Response, next: NextFunction) => {
    console.log("Intercepted by limiter");
    next();
  },
};
export { rateLimitOptions };
