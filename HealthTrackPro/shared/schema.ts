import { pgTable, text, serial, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Health data parameters enum
export const parameterTypes = {
  BLOOD_PRESSURE_SYSTOLIC: 'blood_pressure_systolic',
  BLOOD_PRESSURE_DIASTOLIC: 'blood_pressure_diastolic',
  HEART_RATE: 'heart_rate',
  GLUCOSE: 'glucose'
} as const;

// Health data table
export const healthData = pgTable('health_data', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  parameterType: text('parameter_type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes')
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  healthData: many(healthData)
}));

export const healthDataRelations = relations(healthData, ({ one }) => ({
  user: one(users, { fields: [healthData.userId], references: [users.id] })
}));

// Define schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters")
}).omit({ id: true, createdAt: true });

export const loginUserSchema = z.object({
  email: z.string().email("Must provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const insertHealthDataSchema = createInsertSchema(healthData, {
  value: (schema) => schema.min(0, "Value must be positive")
}).omit({ id: true });

export const selectHealthDataSchema = createSelectSchema(healthData);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type HealthData = typeof healthData.$inferSelect;
export type ParameterType = keyof typeof parameterTypes;
