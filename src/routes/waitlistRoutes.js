import express from 'express';
import { addToWaitlist, getWaitlist, updateWaitlistStatus, removeFromWaitlist } from "../controllers/waitlistController.js";

const router = express.Router();

router.post("/", addToWaitlist);
router.get("/", getWaitlist);
router.put("/:id/status", updateWaitlistStatus);
router.delete("/:id", removeFromWaitlist);

export default router;