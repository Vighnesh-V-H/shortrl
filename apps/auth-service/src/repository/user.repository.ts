import {logger} from "@shared/logger";
import { db } from "@shortrl/db/client";
import { user, type User, type NewUser } from "@shortrl/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  async createUser(newUser: NewUser): Promise<User> {
    try {
      return await db.transaction(async (tx) => {
        const rows = await tx.insert(user).values(newUser).returning();
        const createdUser = rows[0];

        if (!createdUser) {
          throw new Error("Failed to create user");
        }

        logger.info({ userId: createdUser.id }, "User created successfully");
        return createdUser;
      });
    } catch (error) {
      logger.error({ error }, "Failed to create user");
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, email));
      return foundUser || null;
    } catch (error) {
      logger.error({ error, email }, "Failed to find user by email");
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, id));
      return foundUser || null;
    } catch (error) {
      logger.error({ error, id }, "Failed to find user by id");
      throw error;
    }
  }
}
