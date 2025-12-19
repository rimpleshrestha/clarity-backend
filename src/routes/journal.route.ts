import express from "express";
import {
  createJournal,
  deleteJournal,
  getJournalById,
  getJournals,
  saveJournal,
  unlockJournal,
  updateJournal,
} from "../controller/journal.controller.js";
import authorizeUser from "../middleware/verification.middleware.js";
import { verifyUnlockToken } from "../middleware/journal-unlock.middleware.js";

const router = express.Router();

router.post("/journal", authorizeUser, createJournal);
router.get("/journal", authorizeUser, getJournals);
router.put("/journal/:id", authorizeUser, verifyUnlockToken, updateJournal);
router.get("/journal/:id", authorizeUser, verifyUnlockToken, getJournalById);
router.post("/unlock-journal", authorizeUser, unlockJournal);
router.delete("/journal/:id", authorizeUser, deleteJournal);
router.patch("/journal/:id/save", authorizeUser, saveJournal);

export default router ;