import type { Request, Response } from "express";
import { ZodError } from "zod";
import { AnalyticsService } from "../services/analyticsService";
import {
  trackClickSchema,
  urlIdParamSchema,
  queryParamsSchema,
} from "../schema/analytics";

const analyticsService = new AnalyticsService();

export const trackClick = async (req: Request, res: Response) => {
  try {
    const body = trackClickSchema.parse(req.body);
    const result = await analyticsService.trackClick(body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to track click event");
  }
};

export const getClicks = async (req: Request, res: Response) => {
  try {
    const { urlId } = urlIdParamSchema.parse(req.params);
    const { from, to } = queryParamsSchema.parse(req.query);

    const result = await analyticsService.getClicksByUrlId(urlId, from, to);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve clicks");
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { urlId } = urlIdParamSchema.parse(req.params);
    const { limit } = queryParamsSchema.parse(req.query);

    const result = await analyticsService.getClickSummary(urlId, limit);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve click summary");
  }
};

export const getTimeseries = async (req: Request, res: Response) => {
  try {
    const { urlId } = urlIdParamSchema.parse(req.params);
    const { from, to } = queryParamsSchema.parse(req.query);

    const result = await analyticsService.getClickTimeseries(urlId, from, to);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Failed to retrieve timeseries data");
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

  if (message === "Failed to track click event") {
    return res.status(500).json({ error: message });
  }

  return res.status(500).json({ error: message });
};
