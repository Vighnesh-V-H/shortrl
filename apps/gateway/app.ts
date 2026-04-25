import express from "express";
import { Pool } from "pg";
import { Redis } from "ioredis";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createHealthRoutes } from "./src/routes/gateway";
import { services } from "./src/utils/services";

const app = express();


const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(createHealthRoutes(db, redis));

app.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.use(
  "/urls",
  createProxyMiddleware({
    target: services.url,
    changeOrigin: true,
    pathRewrite: { "^/urls": "" },
  })
);

app.use(
  "/users",
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: { "^/users": "" },
  })
);

app.use(
  "/analytics",
  createProxyMiddleware({
    target: services.analytics,
    changeOrigin: true,
  })
);

app.use(express.json());

app.listen(8085, () => {
  console.log("Gateway running on 8085");
});

