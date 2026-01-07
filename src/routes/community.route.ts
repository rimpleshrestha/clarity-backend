import upload from "../../lib/upload";
import {
  createPost,
  deletePost,
  getAllPosts,
  toggleLike,
  updatePost,
} from "../controller/community.controller";
import authorizeUser from "../middleware/verification.middleware";
import { Router } from "express";

const router = Router();

router.get("/posts", authorizeUser, getAllPosts);
router.post("/posts", authorizeUser, upload.single("image"), createPost);
router.put("/posts/:id", authorizeUser, upload.single("image"), updatePost);
router.delete("/posts/:id", authorizeUser, deletePost);
router.post("/posts/:id/like", authorizeUser, toggleLike);

export default router;
