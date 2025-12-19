import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { pinSchema } from "../../lib/zod-schema.js";

const createPin = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const validation = pinSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const create = await prisma.pin.create({
      data: {
        code: validation.data.code,
        user_id: Number(user_id),
      },
    });
    if (!create) {
      return res.status(400).json({
        message: "Failed to create",
      });
    }
    return res.status(201).json({
      message: "Pin has been created",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const updatePin = async (req: Request, res: Response) => {};
const getPinOfUser = async (req: Request, res: Response) => {};

export { createPin, updatePin, getPinOfUser };
