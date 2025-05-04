import { db } from "@db";
import { users, healthData, parameterTypes, type User, type HealthData } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import bcrypt from 'bcryptjs';

export const storage = {
  // User related operations
  async createUser(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users)
      .values({ username, email, password: hashedPassword })
      .returning();
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return user;
  },

  async getUserById(id: number): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return user;
  },

  async verifyUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    return user;
  },

  // Health data related operations
  async createHealthData(userId: number, parameterType: string, value: number, timestamp?: Date, notes?: string): Promise<HealthData> {
    const [data] = await db.insert(healthData)
      .values({
        userId,
        parameterType,
        value: value.toString(),
        timestamp: timestamp || new Date(),
        notes
      })
      .returning();
    return data;
  },

  async getHealthDataByUserId(userId: number, dateFrom?: Date, dateTo?: Date): Promise<HealthData[]> {
    let query = db.select().from(healthData)
      .where(eq(healthData.userId, userId))
      .orderBy(desc(healthData.timestamp));

    if (dateFrom) {
      query = query.where(gte(healthData.timestamp, dateFrom));
    }

    if (dateTo) {
      query = query.where(lte(healthData.timestamp, dateTo));
    }

    return await query;
  },

  async getHealthDataByType(userId: number, parameterType: string, dateFrom?: Date, dateTo?: Date): Promise<HealthData[]> {
    let query = db.select().from(healthData)
      .where(
        and(
          eq(healthData.userId, userId),
          eq(healthData.parameterType, parameterType)
        )
      )
      .orderBy(desc(healthData.timestamp));

    if (dateFrom) {
      query = query.where(gte(healthData.timestamp, dateFrom));
    }

    if (dateTo) {
      query = query.where(lte(healthData.timestamp, dateTo));
    }

    return await query;
  },

  async getLatestHealthData(userId: number, parameterType: string): Promise<HealthData | undefined> {
    const data = await db.query.healthData.findFirst({
      where: and(
        eq(healthData.userId, userId),
        eq(healthData.parameterType, parameterType)
      ),
      orderBy: desc(healthData.timestamp)
    });
    return data;
  },

  async updateHealthData(id: number, data: Partial<HealthData>): Promise<HealthData | undefined> {
    const [updated] = await db
      .update(healthData)
      .set(data)
      .where(eq(healthData.id, id))
      .returning();
    return updated;
  },

  async deleteHealthData(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(healthData)
      .where(eq(healthData.id, id))
      .returning();
    return !!deleted;
  }
};
