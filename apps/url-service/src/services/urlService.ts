import { db } from "@shortrl/db/client";
import { url as urlTable } from "@shortrl/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@shared/logger";
import { isValidUrl } from "../utils/validateUrl";
import type { CreateUrlRequest, CreateUrlResponse } from "../interface/url";
import { generateShortUrl } from "../utils/generateUrl";

export class UrlService {
  async createUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    if (!data) {
      logger.error("Request data is required");
      throw new Error("Request data is required");
    }

    const name = data.name?.trim();
    const originalUrl = data.originalUrl?.trim();

    if (!name) {
      logger.error("Name is required");
      throw new Error("Name is required");
    }

    if (!originalUrl) {
      logger.error("Original URL is required");
      throw new Error("Original URL is required");
    }

    if (!isValidUrl(originalUrl)) {
      logger.error({ originalUrl }, "Invalid URL format");
      throw new Error("Invalid URL format");
    }

    logger.info({ name, originalUrl }, "Creating new shortened URL");

    return await db.transaction(async (tx) => {
      const insertedRows = await tx
        .insert(urlTable)
        .values({
          name,
          originalUrl,
          shortUrl: "temp",
        })
        .returning({
          id: urlTable.id,
        });

      const inserted = insertedRows[0];

      if (!inserted?.id) {
        logger.error("Failed to create URL record");
        throw new Error("Failed to create URL record");
      }

      const shortUrl = generateShortUrl(name, inserted.id, originalUrl);

      await tx
        .update(urlTable)
        .set({ shortUrl })
        .where(eq(urlTable.id, inserted.id));

      const records = await tx
        .select()
        .from(urlTable)
        .where(eq(urlTable.id, inserted.id))
        .limit(1);

      const record = records[0];

      if (!record) {
        logger.error({ id: inserted.id }, "Failed to fetch created URL");
        throw new Error("Failed to fetch created URL");
      }

      if (
        record.id === undefined ||
        record.name === undefined ||
        record.originalUrl === undefined ||
        record.shortUrl === undefined ||
        record.createdAt === undefined
      ) {
        logger.error({ record }, "Created URL record is incomplete");
        throw new Error("Created URL record is incomplete");
      }

      logger.info({ id: record.id, shortUrl: record.shortUrl }, "URL created successfully");

      return {
        id: record.id,
        name: record.name,
        originalUrl: record.originalUrl,
        shortUrl: record.shortUrl,
        createdAt: record.createdAt,
      };
    });
  }

  async getUrlByShortUrl(shortUrl: string): Promise<string | null> {
    if (!shortUrl) {
      logger.error("Short URL is required");
      throw new Error("Short URL is required");
    }

    logger.info({ shortUrl }, "Retrieving original URL for short URL");

    const records = await db
      .select({
        originalUrl: urlTable.originalUrl,
        deletedAt: urlTable.deletedAt,
      })
      .from(urlTable)
      .where(eq(urlTable.shortUrl, shortUrl))
      .limit(1);

    const record = records[0];

    if (!record) {
      logger.warn({ shortUrl }, "Short URL not found");
      return null;
    }

    if (record.deletedAt) {
      logger.warn({ shortUrl }, "Short URL is deleted");
      return null;
    }

    logger.info({ shortUrl, originalUrl: record.originalUrl }, "Original URL retrieved successfully");

    return record.originalUrl;
  }
}
