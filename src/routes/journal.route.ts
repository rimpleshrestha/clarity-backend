import express from "express";
import {
  createJournal,
  deleteJournal,
  getJournals,
  updateJournal,
} from "../controller/journal.controller.js";
import authorizeUser from "../middleware/verification.middleware.js";

const router = express.Router();

router.post("/journal", authorizeUser, createJournal);
router.get("/journal", authorizeUser, getJournals);
router.put("/journal/:id", authorizeUser, updateJournal);
router.delete("/journal/:id", authorizeUser, deleteJournal);

export default router;
