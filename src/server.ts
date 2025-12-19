import cors from "cors";
import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { rateLimitOptions } from "../lib/rate-limit.js";
const app = express();
const PORT = process.env.PORT || 4000;
const limiter = rateLimit(rateLimitOptions);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(limiter);

import { prisma } from "../lib/prisma.js";
import userRouter from "./routes/user.route.js";
import pinRouter from "./routes/pin.route.js";
import tagRouter from "./routes/tag.route.js";
import moodRouter from "./routes/feelings.route.js";
import journalRouter from "./routes/journal.route.js";

app.use("/api/v1", userRouter);
app.use("/api/v1", tagRouter);
app.use("/api/v1", moodRouter);
app.use("/api/v1", pinRouter);
app.use("/api/v1", journalRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

const init = async () => {
  prisma.$connect().then(() => {
    console.log("Successfully connected to the database");
  });
  app.listen(PORT, () => {
    console.log("Listening on http://localhost:" + PORT);
  });
};

process.on("SIGINT", async () => {
  console.log("Disconnecting....\n");
  await prisma.$disconnect().then(() => {
    console.log("Disconnected from DB");
  });
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("Disconnecting....\n");
  await prisma.$disconnect().then(() => {
    console.log("Disconnected from DB");
  });
  process.exit(0);
});

init();
