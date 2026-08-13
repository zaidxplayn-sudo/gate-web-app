import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// User table for NextAuth.js accounts and sessions
export const users = text("users");

// Exported types for inference
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;