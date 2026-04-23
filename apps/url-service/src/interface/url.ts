
export interface CreateUrlRequest {
  name: string;
  originalUrl: string;

}
export interface ErrorResponse {
  error: string;
}

export interface CreateUrlResponse {
  id: number;
  name: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;

}

export interface UrlResponse {
  id: number;
  name: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
