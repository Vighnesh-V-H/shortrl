import { Router } from "express";
import {
  trackClick,
  getClicks,
  getSummary,
  getTimeseries,
  health,
} from "../controllers/analytics.controller";

const router = Router();

router.get("/health", health);
router.post("/track", trackClick);
router.get("/clicks/:urlId", getClicks);
router.get("/summary/:urlId", getSummary);
router.get("/timeseries/:urlId", getTimeseries);

export default router;
