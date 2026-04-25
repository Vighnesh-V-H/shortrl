import type { Request, Response } from "express";
import { ZodError } from "zod";
import { UrlService } from "../services/urlService";
import {
  createUrlSchema,
  updateUrlSchema,
  urlIdParamSchema,
  shortUrlParamSchema,
} from "../schema/url";

const urlService = new UrlService();

export const save = async (req: Request, res: Response) => {
  try {
    const body = createUrlSchema.parse(req.body);
    const result = await urlService.createUrl(body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to create URL");
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = urlIdParamSchema.parse(req.params);
    const result = await urlService.getUrlById(id);

    if (!result) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve URL");
  }
};

export const getByShortUrl = async (req: Request, res: Response) => {
  try {
    const { shortUrl } = shortUrlParamSchema.parse(req.params);
    const originalUrl = await urlService.getUrlByShortUrl(shortUrl);

    if (!originalUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    return res.status(200).json({ originalUrl });
  } catch (err) {
    return handleError(err, res, "Failed to resolve short URL");
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await urlService.getAllUrls();
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve URLs");
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = urlIdParamSchema.parse(req.params);
    const body = updateUrlSchema.parse(req.body);
    const result = await urlService.updateUrl(id, body);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to update URL");
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = urlIdParamSchema.parse(req.params);
    await urlService.deleteUrl(id);
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res, "Failed to delete URL");
  }
};

export const health = (_req: Request, res: Response) => {
  return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};

const handleError = (err: unknown, res: Response, fallback: string) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  const message = err instanceof Error ? err.message : fallback;

  if (message === "URL not found") {
    return res.status(404).json({ error: message });
  }

  if (message === "No fields to update") {
    return res.status(400).json({ error: message });
  }

  return res.status(500).json({ error: message });
};
