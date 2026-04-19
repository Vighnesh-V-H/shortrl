import { Pool } from "pg";
import { Redis } from "ioredis";

export async function checkService(serviceUrl: string): Promise<string> {
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return "ok";
    }
    return "down";
  } catch {
    return "down";
  }
}

export async function checkDatabase(db: Pool): Promise<string> {
  try {
    await db.query("SELECT 1");
    return "ok";
  } catch {
    return "down";
  }
}

export async function checkRedis(redis: Redis): Promise<string> {
  try {
    await redis.ping();
    return "ok";
  } catch {
    return "down";
  }
}
