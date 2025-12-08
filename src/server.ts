import cors from "cors";
import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cookieParser from "cookie-parser";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
// Routes

import { prisma } from "../lib/prisma.js";
import userRouter from "./routes/user.route.js";
app.use("/api/v1", userRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", err);
  // Catches when you throw an error
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
