import type { Request, Response } from "express";
import { tagSchema } from "../../lib/zod-schema.js";

import { prisma } from "../../lib/prisma.js";

const createTag = async (req: Request, res: Response) => {
  try {
    const validation = tagSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const create = await prisma.tag.create({
      data: {
        name: validation.data?.name,
      },
    });
    if (!create) {
      return res.status(400).json({ message: "Failed to create" });
    }
    return res.status(201).json({
      message: "Tag successfully created",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const getTags = async (req: Request, res: Response) => {
  try {
    const results = await prisma.tag.findMany({});

    if (!results.length) {
      return res.status(400).json({
        message: "Couldnt fetch the data",
      });
    }
    return res.status(200).json({
      message: "successfully fetched the tags",
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
const deleteTag = async (req: Request, res: Response) => {};
const updateTag = async (req: Request, res: Response) => {};

export { getTags, createTag };
