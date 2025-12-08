import type { Request, Response } from "express";
import { moodSchema } from "../../lib/zod-schema.js";
import { prisma } from "../../lib/prisma.js";

const createMood = async (req: Request, res: Response) => {
  try {
    const validation = moodSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const create = await prisma.mood.create({
      data: {
        name: validation.data?.name,
        icon: validation.data?.icon,
      },
    });
    if (!create) {
      return res.status(400).json({ message: "Failed to create" });
    }
    return res.status(201).json({
      message: "Mood successfully created",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const getMoods = async (req: Request, res: Response) => {
  try {
    const results = await prisma.mood.findMany({});

    if (!results.length) {
      return res.status(400).json({
        message: "Couldnt fetch the data",
      });
    }
    return res.status(200).json({
      message: "successfully fetched the moods",
      data: results,
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const deleteMood = async (req: Request, res: Response) => {};
const updateMood = async (req: Request, res: Response) => {};

export { getMoods, createMood };
