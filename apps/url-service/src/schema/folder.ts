import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, { message: "Folder name is required" }).trim(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, { message: "Folder name cannot be empty" }).trim(),
});

export const folderIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid folder ID" }),
});

export const addUrlToFolderSchema = z.object({
  urlId: z.coerce.number().int().positive({ message: "Invalid URL ID" }),
});

export const removeUrlFromFolderSchema = z.object({
  urlId: z.coerce.number().int().positive({ message: "Invalid URL ID" }),
});
