import express from "express";
import { createMood, getMoods } from "../controller/feelings.controller.js";
const router = express.Router();

router.post("/create-mood", createMood);
router.get("/mood", getMoods);

export default router;
