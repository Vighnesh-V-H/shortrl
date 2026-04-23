export type UrlId = string;

export interface UrlMetadata {
  title?: string;
  description?: string;
  favicon?: string;
}

export interface UrlEntry {
  id: UrlId;
  originalUrl: string;
  alias?: string;
  createdAt: string;
  updatedAt?: string;
  visits?: number;
  metadata?: UrlMetadata;
  disabled?: boolean;
}

export interface CreateUrlPayload {
  url: string;
  alias?: string;
  metadata?: UrlMetadata;
}

export type SaveUrlResult = UrlEntry;
