export interface HealthCheck {
  [key: string]: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  uptime: number;
  timestamp: string;
  checks: HealthCheck;
}
