import { db } from "@shortrl/db/client";
import { folder as folderTable, folderUrls, url as urlTable } from "@shortrl/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { logger } from "@shared/logger";
import type {
  CreateFolderRequest,
  UpdateFolderRequest,
  FolderResponse,
  FolderWithUrlsResponse,
} from "../interface/folder";

export class FolderService {
  async createFolder(data: CreateFolderRequest): Promise<FolderResponse> {
    const name = data.name.trim();

    logger.info({ name }, "Creating new folder");

    const [created] = await db
      .insert(folderTable)
      .values({ name })
      .returning();

    if (!created) {
      throw new Error("Failed to create folder");
    }

    logger.info({ id: created.id }, "Folder created successfully");

    return {
      id: created.id,
      name: created.name,
      createdAt: created.createdAt,
      deletedAt: created.deletedAt,
    };
  }

  async getFolderById(id: string): Promise<FolderWithUrlsResponse | null> {
    logger.info({ id }, "Retrieving folder by ID");

    const [record] = await db
      .select()
      .from(folderTable)
      .where(and(eq(folderTable.id, id), isNull(folderTable.deletedAt)));

    if (!record) {
      logger.warn({ id }, "Folder not found");
      return null;
    }

    const urlJoins = await db
      .select({ urlId: folderUrls.urlId })
      .from(folderUrls)
      .where(eq(folderUrls.folderId, id));

    const urlIds = urlJoins.map((j) => j.urlId);

    let urls: {
      id: number;
      name: string;
      originalUrl: string;
      shortUrl: string;
      createdAt: Date;
    }[] = [];

    if (urlIds.length > 0) {
      const urlRecords = await db
        .select()
        .from(urlTable)
        .where(and(inArray(urlTable.id, urlIds), isNull(urlTable.deletedAt)));

      urls = urlRecords.map((u) => ({
        id: u.id,
        name: u.name,
        originalUrl: u.originalUrl,
        shortUrl: u.shortUrl,
        createdAt: u.createdAt,
      }));
    }

    return {
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
      urls,
    };
  }

  async getAllFolders(): Promise<FolderResponse[]> {
    logger.info("Retrieving all folders");

    const records = await db
      .select()
      .from(folderTable)
      .where(isNull(folderTable.deletedAt));

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
      deletedAt: record.deletedAt,
    }));
  }

  async updateFolder(id: string, data: UpdateFolderRequest): Promise<FolderResponse> {
    logger.info({ id, data }, "Updating folder");

    const [existing] = await db
      .select()
      .from(folderTable)
      .where(and(eq(folderTable.id, id), isNull(folderTable.deletedAt)));

    if (!existing) {
      throw new Error("Folder not found");
    }

    await db
      .update(folderTable)
      .set({ name: data.name.trim() })
      .where(eq(folderTable.id, id));

    const [updated] = await db
      .select()
      .from(folderTable)
      .where(eq(folderTable.id, id));

    if (!updated) {
      throw new Error("Failed to fetch updated folder");
    }

    logger.info({ id }, "Folder updated successfully");

    return {
      id: updated.id,
      name: updated.name,
      createdAt: updated.createdAt,
      deletedAt: updated.deletedAt,
    };
  }

  async deleteFolder(id: string): Promise<void> {
    logger.info({ id }, "Soft deleting folder");

    const [existing] = await db
      .select()
      .from(folderTable)
      .where(and(eq(folderTable.id, id), isNull(folderTable.deletedAt)));

    if (!existing) {
      throw new Error("Folder not found");
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(folderUrls)
        .where(eq(folderUrls.folderId, id));

      await tx
        .update(folderTable)
        .set({ deletedAt: new Date() })
        .where(eq(folderTable.id, id));
    });

    logger.info({ id }, "Folder deleted successfully");
  }

  async addUrlToFolder(folderId: string, urlId: number): Promise<void> {
    logger.info({ folderId, urlId }, "Adding URL to folder");

    const [folderRecord] = await db
      .select()
      .from(folderTable)
      .where(and(eq(folderTable.id, folderId), isNull(folderTable.deletedAt)));

    if (!folderRecord) {
      throw new Error("Folder not found");
    }

    const [urlRecord] = await db
      .select()
      .from(urlTable)
      .where(and(eq(urlTable.id, urlId), isNull(urlTable.deletedAt)));

    if (!urlRecord) {
      throw new Error("URL not found");
    }

    const [existing] = await db
      .select()
      .from(folderUrls)
      .where(and(eq(folderUrls.folderId, folderId), eq(folderUrls.urlId, urlId)));

    if (existing) {
      throw new Error("URL already exists in folder");
    }

    await db
      .insert(folderUrls)
      .values({ folderId, urlId });

    logger.info({ folderId, urlId }, "URL added to folder successfully");
  }

  async removeUrlFromFolder(folderId: string, urlId: number): Promise<void> {
    logger.info({ folderId, urlId }, "Removing URL from folder");

    const [existing] = await db
      .select()
      .from(folderUrls)
      .where(and(eq(folderUrls.folderId, folderId), eq(folderUrls.urlId, urlId)));

    if (!existing) {
      throw new Error("URL not found in folder");
    }

    await db
      .delete(folderUrls)
      .where(and(eq(folderUrls.folderId, folderId), eq(folderUrls.urlId, urlId)));

    logger.info({ folderId, urlId }, "URL removed from folder successfully");
  }
}
