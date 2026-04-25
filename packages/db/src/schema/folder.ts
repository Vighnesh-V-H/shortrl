import { pgTable, text, timestamp, primaryKey, serial, integer } from "drizzle-orm/pg-core";
import { url } from "./url";

export const folder = pgTable("folder", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const folderUrls = pgTable(
  "folder_urls",
  {
    folderId: text("folder_id")
      .notNull()
      .references(() => folder.id),
    urlId: integer("url_id")
      .notNull()
      .references(() => url.id),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.folderId, table.urlId] }),
  })
);

export type Folder = typeof folder.$inferSelect;
export type NewFolder = typeof folder.$inferInsert;
