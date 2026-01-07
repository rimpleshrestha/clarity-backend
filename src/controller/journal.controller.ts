import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { decryptAES, encryptAES } from "../../lib/crypto.js";
import { encryptJWT } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { journalSchema } from "../../lib/zod-schema.js";
import { updateStreak } from "./streak.controller.js";
const createJournal = async (req: Request, res: Response) => {
  try {
    const validation = journalSchema.safeParse(req.body);
    const user_id = req.user;
    if (!validation.success) {
      return res.status(401).json({
        message: "Some Field are missing fill them ",
        error: JSON.stringify(
          validation.error.issues.map((issue) => issue.message).join(", ")
        ),
      });
    }
    const encryptedBody = encryptAES({ data: validation.data.entry });
    const create = await prisma.journal.create({
      data: {
        entry: encryptedBody,
        is_favorate: validation.data.is_favorate,
        title: validation.data.title,
        mood_id: validation.data.mood_id,
        user_id: Number(user_id),
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
    await updateStreak(user_id);
    return res.status(201).json({
      message: "Journal successfully created",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const getJournals = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const { date_gte, date_lte, title, tag_id, is_favorite } = req.query as {
      title?: string;
      tag_id?: string;
      date_gte?: string;
      date_lte?: string;
      is_favorite?: string;
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
        is_favorate: is_favorite ? { equals: Boolean(is_favorite) } : {},
        created_at:
          date_gte || date_lte
            ? {
                ...(date_gte && { gte: new Date(date_gte) }),
                ...(date_lte && { lte: new Date(date_lte) }),
              }
            : {},
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        tag: true,
        mood: true,
      },
    });

    return res.status(200).json({
      message: "successfully fetched the journals",
      data: results,
    });
  } catch (error) {
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
    const encryptedEntry = encryptAES({ data: data.entry });
    const updated = await prisma.journal.update({
      where: { id: Number(id) },
      data: {
        entry: encryptedEntry,
        is_favorate: data.is_favorate,
        title: data.title,
        mood_id: data.mood_id,
        user_id: Number(req.user),
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
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const unlockJournal = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const user_id = Number(req.user);

    const user_pin = await prisma.pin.findUnique({
      where: {
        user_id,
      },
    });

    if (!user_pin) {
      return res.status(400).json({
        message: "User PIN not found",
      });
    }

    const comparePins = await bcrypt.compare(pin, user_pin.code);
    if (!comparePins) {
      return res.status(401).json({
        message: "Invalid PIN",
      });
    }

    const unlockToken = encryptJWT({
      data: { user_id },
      TTL: "5m",
    });

    return res.status(200).json({
      message: "PIN matched",
      data: {
        "unlock-token": unlockToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};

const getJournalById = async (req: Request, res: Response) => {
  try {
    const user_id = req.user;
    const entry_owner_id = req.unlock?.user_id;
    if (user_id !== entry_owner_id) {
      return res.status(400).json({
        message: "The Owner doesnt match",
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Journal ID must be sent",
      });
    }
    const journalEntry = await prisma.journal.findFirst({
      where: {
        id: Number(id),
        user_id: user_id as number,
      },
      include: {
        mood: true,
        tag: true,
      },
    });
    if (!journalEntry) {
      return res.status(200).json({
        message: "Failed to retreive the entry",
      });
    }
    return res.status(200).json({
      message: "Succesfully fetched the Entry",
      data: {
        ...journalEntry,
        entry: decryptAES({ data: journalEntry.entry }),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};
const saveJournal = async (req: Request, res: Response) => {
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
      where: {
        id: Number(id),
        user_id: Number(user_id),
      },
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const updated = await prisma.journal.update({
      where: { id: Number(id) },
      data: {
        is_favorate: !journal.is_favorate, // toggle
      },
    });

    return res.status(200).json({
      message: updated.is_favorate ? "Journal saved" : "Journal unsaved",
      data: {
        id: updated.id,
        is_favorate: updated.is_favorate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: JSON.stringify(error),
    });
  }
};

export {
  saveJournal,
  createJournal,
  deleteJournal,
  getJournals,
  updateJournal,
  unlockJournal,
  getJournalById,
};
