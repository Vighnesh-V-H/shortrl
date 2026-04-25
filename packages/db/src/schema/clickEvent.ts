import { pgTable, serial, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { url } from "./url";

export const clickEvent = pgTable(
  "click_event",
  {
    id: serial("id").primaryKey(),
    urlId: integer("url_id")
      .notNull()
      .references(() => url.id),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    country: text("country"),
    city: text("city"),
    device: text("device"),
    browser: text("browser"),
    os: text("os"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    urlIdIdx: index("click_event_url_id_idx").on(table.urlId),
    createdAtIdx: index("click_event_created_at_idx").on(table.createdAt),
  })
);

export type ClickEvent = typeof clickEvent.$inferSelect;
export type NewClickEvent = typeof clickEvent.$inferInsert;
