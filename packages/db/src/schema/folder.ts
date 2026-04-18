import { pgTable , text } from "drizzle-orm/pg-core";
import { url } from "./url";

export const folder = pgTable("folder", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  urlIds: text("url_ids").array().notNull().default([]),
});
