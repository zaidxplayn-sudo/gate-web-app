import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

// Core user account table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  // Hashed with bcrypt; null for OAuth-only accounts
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  // 'user' | 'admin'
  role: text("role").notNull().default("user"),
  // Membership tier: 'free' | 'member' | 'lifetime'
  membership: text("membership").notNull().default("free"),
  provider: text("provider").notNull().default("credentials"),
  // OAuth subject/provider id for account linking
  providerAccountId: text("provider_account_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// OAuth / credential accounts linked to a user
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // 'google' | 'apple' | 'credentials'
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    // encrypted refresh token if available from provider
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    idToken: text("id_token"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

// Single-use, time-limited password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // sha256 hashed token stored, not the raw token
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Persisted session records (mirrors JWT sessions server-side for revocation)
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // jti claim for revocation
  jti: text("jti").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Session = typeof sessions.$inferSelect;
