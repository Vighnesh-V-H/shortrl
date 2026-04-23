

import { db } from "@shortrl/db/client";
import { url as urlTable } from "@shortrl/db/schema";
import { eq } from "drizzle-orm";
import { isValidUrl } from "../utils/validateUrl";
import type { CreateUrlRequest, CreateUrlResponse, UrlResponse } from "../interface/url";
import { generateShortUrl } from "../utils/generateUrl";
import type { Request, Response } from "express";

export async function save(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as CreateUrlRequest;
    if (!data) {
      throw new Error("Request data is required");
    }

    const name = data.name?.trim();
    const originalUrl = data.originalUrl?.trim();

    if (!name) {
      throw new Error("Name is required");
    }

    if (!originalUrl) {
      throw new Error("Original URL is required");
    }

    if (!isValidUrl(originalUrl)) {
      throw new Error("Invalid URL format");
    }

    const result = await db.transaction(async (tx) => {
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

      if (
        record.id === undefined ||
        record.name === undefined ||
        record.originalUrl === undefined ||
        record.shortUrl === undefined ||
        record.createdAt === undefined
      ) {
        throw new Error("Created URL record is incomplete");
      }

      return {
        id: record.id,
        name: record.name,
        originalUrl: record.originalUrl,
        shortUrl: record.shortUrl,
        createdAt: record.createdAt,
      };
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export function health(_req: Request, res: Response): void {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}
