import { Router } from "express";
import { save, health } from "../controllers/url.controller";

const router = Router();

router.post("/save", save);
router.get("/health", health);

export default router;
