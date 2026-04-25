import { z } from "zod";

export const trackClickSchema = z.object({
  urlId: z.coerce.number().int().positive({ message: "Invalid URL ID" }),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referer: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

export const urlIdParamSchema = z.object({
  urlId: z.coerce.number().int().positive({ message: "Invalid URL ID" }),
});

export const queryParamsSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
