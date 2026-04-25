import { db } from "@shortrl/db/client";
import { url as urlTable } from "@shortrl/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { logger } from "@shared/logger";
import { isValidUrl } from "../utils/validateUrl";
import type { CreateUrlRequest, UpdateUrlRequest, CreateUrlResponse, UrlResponse } from "../interface/url";
import { generateShortUrl } from "../utils/generateUrl";

export class UrlService {
  async createUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    const name = data.name.trim();
    const originalUrl = data.originalUrl.trim();

    if (!isValidUrl(originalUrl)) {
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
        throw new Error("Failed to fetch created URL");
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

  async getUrlById(id: number): Promise<UrlResponse | null> {
    logger.info({ id }, "Retrieving URL by ID");

    const [record] = await db
      .select()
      .from(urlTable)
      .where(and(eq(urlTable.id, id), isNull(urlTable.deletedAt)));

    if (!record) {
      logger.warn({ id }, "URL not found");
      return null;
    }

    return {
      id: record.id,
      name: record.name,
      originalUrl: record.originalUrl,
      shortUrl: record.shortUrl,
      createdAt: record.createdAt,
      deletedAt: record.deletedAt,
    };
  }

  async getUrlByShortUrl(shortUrl: string): Promise<string | null> {
    logger.info({ shortUrl }, "Retrieving original URL for short URL");

    const [record] = await db
      .select({
        originalUrl: urlTable.originalUrl,
        deletedAt: urlTable.deletedAt,
      })
      .from(urlTable)
      .where(eq(urlTable.shortUrl, shortUrl))
      .limit(1);

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

  async getAllUrls(): Promise<UrlResponse[]> {
    logger.info("Retrieving all URLs");

    const records = await db
      .select()
      .from(urlTable)
      .where(isNull(urlTable.deletedAt));

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      originalUrl: record.originalUrl,
      shortUrl: record.shortUrl,
      createdAt: record.createdAt,
      deletedAt: record.deletedAt,
    }));
  }

  async updateUrl(id: number, data: UpdateUrlRequest): Promise<UrlResponse> {
    logger.info({ id, data }, "Updating URL");

    const [existing] = await db
      .select()
      .from(urlTable)
      .where(and(eq(urlTable.id, id), isNull(urlTable.deletedAt)));

    if (!existing) {
      throw new Error("URL not found");
    }

    const updateData: Record<string, string> = {};

    if (data.name) {
      updateData.name = data.name.trim();
    }

    if (data.originalUrl) {
      if (!isValidUrl(data.originalUrl)) {
        throw new Error("Invalid URL format");
      }
      updateData.originalUrl = data.originalUrl.trim();
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields to update");
    }

    await db
      .update(urlTable)
      .set(updateData)
      .where(eq(urlTable.id, id));

    const [updated] = await db
      .select()
      .from(urlTable)
      .where(eq(urlTable.id, id));

    if (!updated) {
      throw new Error("Failed to fetch updated URL");
    }

    logger.info({ id }, "URL updated successfully");

    return {
      id: updated.id,
      name: updated.name,
      originalUrl: updated.originalUrl,
      shortUrl: updated.shortUrl,
      createdAt: updated.createdAt,
      deletedAt: updated.deletedAt,
    };
  }

  async deleteUrl(id: number): Promise<void> {
    logger.info({ id }, "Soft deleting URL");

    const [existing] = await db
      .select()
      .from(urlTable)
      .where(and(eq(urlTable.id, id), isNull(urlTable.deletedAt)));

    if (!existing) {
      throw new Error("URL not found");
    }

    await db
      .update(urlTable)
      .set({ deletedAt: new Date() })
      .where(eq(urlTable.id, id));

    logger.info({ id }, "URL deleted successfully");
  }
}
