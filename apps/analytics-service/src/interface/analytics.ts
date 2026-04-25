export interface TrackClickRequest {
  urlId: number;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export interface ClickEventResponse {
  id: number;
  urlId: number;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  createdAt: Date;
}

export interface ClickSummaryResponse {
  urlId: number;
  totalClicks: number;
  uniqueIps: number;
  topCountries: { country: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topDevices: { device: string; count: number }[];
  topReferers: { referer: string; count: number }[];
}

export interface ClickTimeseriesPoint {
  date: string;
  count: number;
}

export interface ErrorResponse {
  error: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
