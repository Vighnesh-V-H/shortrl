import type { Request, Response } from "express";
import { ZodError } from "zod";
import { FolderService } from "../services/folderService";
import {
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
  addUrlToFolderSchema,
  removeUrlFromFolderSchema,
} from "../schema/folder";

const folderService = new FolderService();

export const create = async (req: Request, res: Response) => {
  try {
    const body = createFolderSchema.parse(req.body);
    const result = await folderService.createFolder(body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to create folder");
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = folderIdParamSchema.parse(req.params);
    const result = await folderService.getFolderById(id);

    if (!result) {
      return res.status(404).json({ error: "Folder not found" });
    }

    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve folder");
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await folderService.getAllFolders();
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve folders");
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = folderIdParamSchema.parse(req.params);
    const body = updateFolderSchema.parse(req.body);
    const result = await folderService.updateFolder(id, body);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to update folder");
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = folderIdParamSchema.parse(req.params);
    await folderService.deleteFolder(id);
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res, "Failed to delete folder");
  }
};

export const addUrl = async (req: Request, res: Response) => {
  try {
    const { id } = folderIdParamSchema.parse(req.params);
    const { urlId } = addUrlToFolderSchema.parse(req.body);
    await folderService.addUrlToFolder(id, urlId);
    return res.status(201).json({ message: "URL added to folder" });
  } catch (err) {
    return handleError(err, res, "Failed to add URL to folder");
  }
};

export const removeUrl = async (req: Request, res: Response) => {
  try {
    const { id } = folderIdParamSchema.parse(req.params);
    const { urlId } = removeUrlFromFolderSchema.parse(req.body);
    await folderService.removeUrlFromFolder(id, urlId);
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res, "Failed to remove URL from folder");
  }
};

const handleError = (err: unknown, res: Response, fallback: string) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  const message = err instanceof Error ? err.message : fallback;

  if (message === "Folder not found" || message === "URL not found" || message === "URL not found in folder") {
    return res.status(404).json({ error: message });
  }

  if (message === "URL already exists in folder") {
    return res.status(409).json({ error: message });
  }

  return res.status(500).json({ error: message });
};
