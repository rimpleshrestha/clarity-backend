import express from "express";
import { createTag, getTags } from "../controller/tag.controller.js";

const router = express.Router();

router.post("/create-tag", createTag);
router.get("/tags", getTags);

export default router;
