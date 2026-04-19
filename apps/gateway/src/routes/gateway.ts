import { Router } from "express";
import { Pool } from "pg";
import { Redis } from "ioredis";
import { healthCheck } from "../controllers/gateway.health.controller";

export const createHealthRoutes = (db: Pool, redis: Redis) => {
  const router = Router();

  router.get("/health", healthCheck(db, redis));

  return router;
};
