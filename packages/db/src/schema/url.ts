import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const url = pgTable("url", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalUrl: text("original_url").notNull(),
  shortUrl: text("short_url").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type Url = typeof url.$inferSelect;
export type NewUrl = typeof url.$inferInsert;
