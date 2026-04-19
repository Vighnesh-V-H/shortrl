import { Router } from "express";
import {
  signup,
  signin,
  health,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/health", health);

export default router;
