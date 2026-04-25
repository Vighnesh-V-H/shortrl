import { Router } from "express";
import {
  create,
  getById,
  getAll,
  update,
  remove,
  addUrl,
  removeUrl,
} from "../controllers/folder.controller";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/:id/urls", addUrl);
router.delete("/:id/urls", removeUrl);

export default router;
