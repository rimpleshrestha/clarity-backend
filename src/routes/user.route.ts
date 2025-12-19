import express from "express";
import {
  login,
  logout,
  refreshRecycle,
  signup,
  upsertUserPin,
} from "../controller/user.controller.js";
import { verifyJWT } from "../../lib/jwt.js";
import authorizeUser from "../middleware/verification.middleware.js";
const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.post("/upsert-pin", authorizeUser, upsertUserPin);
router.get("/logout", logout);
router.get("/refresh-token", refreshRecycle);
export default router;
