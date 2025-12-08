import express from "express";
import {
  login,
  logout,
  refreshRecycle,
  signup,
} from "../controller/user.controller.js";
const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/refresh-token", refreshRecycle);
export default router;
