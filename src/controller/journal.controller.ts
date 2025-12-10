import type { Request, Response } from "express";
import { journalSchema } from "../../lib/zod-schema.js";
import { prisma } from "../../lib/prisma.js";

const createJournal = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const validation = journalSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const create = await prisma.journal.create({
      data: {
        entry: validation.data.entry,
        is_favorate: validation.data.is_favorate,
        title: validation.data.title,
        mood_id: validation.data.mood_id,
        user_id,
        tag: {
          connect: validation.data.tag_id.map((tag_id) => ({
            id: tag_id,
          })),
        },
      },
    });
    if (!create) {
      return res.status(400).json({ message: "Failed to create" });
    }
    return res.status(201).json({
      message: "Journal successfully created",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const getJournals = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const { date_gte, date_lte, title, tag_id } = req.query as {
      title?: string;
      tag_id?: string;
      date_gte?: string;
      date_lte?: string;
    };
    if (!user_id) {
      return res.status(400).json({
        message: "User ID must be provided",
      });
    }
    const results = await prisma.journal.findMany({
      where: {
        user_id: Number(user_id),
        title: title
          ? {
              contains: title,
              mode: "insensitive",
            }
          : {},
        tag: tag_id
          ? {
              some: {
                id: Number(tag_id),
              },
            }
          : {},
        created_at:
          date_gte || date_lte
            ? {
                ...(date_gte && { gte: new Date(date_gte) }),
                ...(date_lte && { lte: new Date(date_lte) }),
              }
            : {},
      },
      include: {
        tag: true,
        mood: true,
      },
    });

    if (!results.length) {
      return res.status(400).json({
        message: "Couldnt fetch the data",
      });
    }
    return res.status(200).json({
      message: "successfully fetched the journals",
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
const deleteJournal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Valid Journal ID required" });
    }

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const journal = await prisma.journal.findFirst({
      where: { id: Number(id), user_id: Number(user_id) },
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    await prisma.journal.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      message: "Journal deleted successfully",
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};

const updateJournal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Valid Journal ID required" });
    }

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validation = journalSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid fields",
        error: JSON.stringify(
          validation.error.issues.map((i) => i.message).join(", ")
        ),
      });
    }

    const data = validation.data;
    const existing = await prisma.journal.findFirst({
      where: { id: Number(id), user_id: Number(user_id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const updated = await prisma.journal.update({
      where: { id: Number(id) },
      data: {
        entry: data.entry,
        is_favorate: data.is_favorate,
        title: data.title,
        mood_id: data.mood_id,
        user_id,
        tag: {
          set: [],
          connect: data.tag_id.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        tag: true,
        mood: true,
      },
    });

    return res.status(200).json({
      message: "Journal updated successfully",
      data: updated,
    });
  } catch (error) {
    console.log("Something Went Wrong");
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};

export { getJournals, createJournal, deleteJournal, updateJournal };
