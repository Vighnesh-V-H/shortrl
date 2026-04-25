import { z } from "zod";

export const createUrlSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).trim(),
  originalUrl: z.string().url({ message: "Invalid URL format" }).trim(),
});

export const updateUrlSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }).trim().optional(),
  originalUrl: z.string().url({ message: "Invalid URL format" }).trim().optional(),
});

export const urlIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "Invalid URL ID" }),
});

export const shortUrlParamSchema = z.object({
  shortUrl: z.string().min(1, { message: "Short URL is required" }),
});
