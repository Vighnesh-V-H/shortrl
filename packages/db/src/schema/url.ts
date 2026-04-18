import { pgTable, text } from "drizzle-orm/pg-core";

export const url = pgTable("url", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  originalUrl: text("original_url"),
  shortUrl: text("short_url"),
});
