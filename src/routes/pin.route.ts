import express from "express";
import {
  createPin,
  getPinOfUser,
  updatePin,
} from "../controller/pin.controller.js";
const router = express.Router();

router.post("/pin", createPin);
router.get("/pin/:user_id", getPinOfUser);
router.put("/pin", updatePin);

export default router;
