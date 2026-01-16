import express from "express";
import {
  changePassword,
  deleteUser,
  getMe,
  login,
  logout,
  refreshRecycle,
  signup,
  updateCoverImage,
  updateProfileImage,
  updateUserDetails,
  upsertUserPin,
} from "../controller/user.controller.js";
import { verifyJWT } from "../../lib/jwt.js";
import upload from "../../lib/upload.js";
import authorizeUser from "../middleware/verification.middleware.js";
const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.post("/upsert-pin", authorizeUser, upsertUserPin);
router.get("/logout", logout);
router.get("/refresh-token", refreshRecycle);

router.put(
  "/user/update-profile-image",
  upload.single("pfp"),
  authorizeUser,
  updateProfileImage
);
router.put(
  "/user/update-cover-image",
  upload.single("cover"),
  authorizeUser,
  updateCoverImage
);
router.put("/user/update-details", authorizeUser, updateUserDetails);
router.put("/user/change-password", authorizeUser, changePassword);
router.get("/me", authorizeUser, getMe);
router.delete("/user/delete-account", authorizeUser, deleteUser);
export default router;
