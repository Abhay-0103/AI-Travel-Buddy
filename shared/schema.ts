import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const travelPlans = pgTable("travel_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: integer("budget").notNull(),
  currency: text("currency").notNull(),
  travelers: integer("travelers").notNull(),
  interests: text("interests").array().notNull(),
  additionalNotes: text("additional_notes"),
  itinerary: jsonb("itinerary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTravelPlanSchema = createInsertSchema(travelPlans).omit({
  id: true,
  createdAt: true,
  itinerary: true,
});

export const travelPlanFormSchema = z.object({
  source: z.string().min(1, "Please enter a source location"),
  destination: z.string().min(1, "Please enter a destination"),
  startDate: z.string().min(1, "Please select a start date"),
  endDate: z.string().min(1, "Please select an end date"),
  budget: z.string().min(1, "Please enter a budget").transform(val => parseInt(val, 10)),
  currency: z.string().min(1, "Please select a currency"),
  travelers: z.string().min(1, "Please select number of travelers"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  additionalNotes: z.string().optional(),
});

export type TravelPlanForm = z.infer<typeof travelPlanFormSchema>;
export type TravelPlanRequest = z.infer<typeof insertTravelPlanSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TravelPlan = typeof travelPlans.$inferSelect;
