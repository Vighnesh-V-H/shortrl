import type { Request, Response } from "express";
import { Pool } from "pg";
import { Redis } from "ioredis";
import { services } from "../utils/services";
import { checkDatabase, checkRedis, checkService } from "../utils/health";
import type { HealthCheck, HealthResponse } from "../interface/gateway.interface";


export const healthCheck = (db: Pool, redis: Redis) => {
  return async (_: Request, res: Response<HealthResponse>) => {
    const checks: HealthCheck = {
      database: "down",
      redis: "down",
      authService: "down",
      urlService: "down",
      userService: "down",
    };

    const [dbStatus, redisStatus, authStatus, urlStatus, userStatus] = await Promise.all([
      checkDatabase(db),
      checkRedis(redis),
      checkService(services.auth),
      checkService(services.url),
      checkService(services.user),
    ]);

    checks.database = dbStatus;
    checks.redis = redisStatus;
    checks.authService = authStatus;
    checks.urlService = urlStatus;
    checks.userService = userStatus;

    const allHealthy = Object.values(checks).every((v) => v === "ok");

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? "ok" : "degraded",
      service: "gateway",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    });
  };
};
