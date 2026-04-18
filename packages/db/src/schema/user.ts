import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: timestamp("email_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verificationToken = pgTable("verification_token", {
  token: text("token").notNull().unique().primaryKey(),
  expires: timestamp("expires").notNull(),
  userId: text("user_id").references(() => user.id),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
