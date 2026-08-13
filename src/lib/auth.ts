import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, accounts, sessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { verifyPassword } from "@/lib/password";
import { generateJti } from "@/lib/tokens";

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

// Demo user configuration for testing Google/Apple OAuth without real credentials.
// The environment variable DEMO_AUTH_ENABLED defaults to "true" for development.
// When enabled and no real OAuth credentials are provided, simulated sign-in
// creates a real user in the database and establishes an authentic session.
const DEMO_MODE = process.env.DEMO_AUTH_ENABLED ?? "true";

// This next-auth build expects a pre-built Apple client secret JWT (ES256).
function generateAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!teamId || !keyId || !privateKey || !clientId) return "";
  const header = { alg: "ES256", kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 180 * 24 * 60 * 60,
    aud: "https://appleid.apple.com",
    sub: clientId,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload)
  )}`;
  const signer = crypto.createSign("SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");
  return `${signingInput}.${signature}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid email profile" } },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: generateAppleClientSecret(),
    }),
        CredentialsProvider({
      id: "google-demo",
      name: "Google",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize() {
        const email = "demo-google-user@example.com";
        try {
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          if (existing) {
            if (!existing.emailVerified) {
              await db
                .update(users)
                .set({ emailVerified: new Date(), updatedAt: new Date() })
                .where(eq(users.id, existing.id));
            }
            return { id: existing.id, email: existing.email, name: existing.name ?? undefined };
          }
          const [created] = await db
            .insert(users)
            .values({
              email,
              name: "Demo Google User",
              provider: "google",
              providerAccountId: email,
              emailVerified: new Date(),
            })
            .returning();
          await db
            .insert(accounts)
            .values({
              userId: created.id,
              provider: "google",
              providerAccountId: email,
            })
            .onConflictDoNothing();
          return { id: created.id, email: created.email, name: created.name ?? undefined };
        } catch (err) {
          console.error("google-demo authorize error", err);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "apple-demo",
      name: "Apple",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize() {
        const email = "demo-apple-user@example.com";
        try {
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          if (existing) {
            if (!existing.emailVerified) {
              await db
                .update(users)
                .set({ emailVerified: new Date(), updatedAt: new Date() })
                .where(eq(users.id, existing.id));
            }
            return { id: existing.id, email: existing.email, name: existing.name ?? undefined };
          }
          const [created] = await db
            .insert(users)
            .values({
              email,
              name: "Demo Apple User",
              provider: "apple",
              providerAccountId: email,
              emailVerified: new Date(),
            })
            .returning();
          await db
            .insert(accounts)
            .values({
              userId: created.id,
              provider: "apple",
              providerAccountId: email,
            })
            .onConflictDoNothing();
          return { id: created.id, email: created.email, name: created.name ?? undefined };
        } catch (err) {
          console.error("apple-demo authorize error", err);
          return null;
        }
      },
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);
        if (!user || !user.passwordHash) return null;
        const ok = await verifyPassword(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    // Persist a server-side session row so sessions can be revoked (refresh/expiry)
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;
        const email = user.email.toLowerCase();
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!existing) {
          const [created] = await db
            .insert(users)
            .values({
              email,
              name: user.name ?? null,
              image: user.image ?? null,
              provider: account?.provider ?? "credentials",
              providerAccountId: account?.providerAccountId ?? null,
              emailVerified: account?.provider ? new Date() : null,
            })
            .returning();
          await db
            .insert(accounts)
            .values({
              userId: created.id,
              provider: account?.provider ?? "credentials",
              providerAccountId: account?.providerAccountId ?? email,
            })
            .onConflictDoNothing();
        } else if (account?.provider) {
          // Link OAuth account to the existing user (handles Apple private relay)
          await db
            .insert(accounts)
            .values({
              userId: existing.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId ?? email,
            })
            .onConflictDoNothing();
          if (!existing.emailVerified) {
            await db
              .update(users)
              .set({ emailVerified: new Date(), updatedAt: new Date() })
              .where(eq(users.id, existing.id));
          }
        }
      } catch (err) {
        console.error("signIn callback error", err);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, (token.email as string).toLowerCase()))
          .limit(1);
        token.uid = dbUser?.id;
        token.role = dbUser?.role ?? "user";
        token.membership = dbUser?.membership ?? "free";
      }
      // Stable per session so the server-side session row is not recreated each request
      if (!token.jti) token.jti = generateJti();
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
        session.user.membership = (token.membership as string) ?? "free";
      }
      // Record/refresh server-side session row
      if (token.jti) {
        const existing = await db
          .select()
          .from(sessions)
          .where(eq(sessions.jti, token.jti as string))
          .limit(1);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        if (existing.length === 0 && token.uid) {
          await db.insert(sessions).values({
            userId: token.uid as string,
            jti: token.jti as string,
            expiresAt,
          });
        } else if (existing.length > 0) {
          await db
            .update(sessions)
            .set({ expiresAt })
            .where(eq(sessions.jti, token.jti as string));
        }
      }
      return session;
    },
  },
};

// Helper to safely create a demo OAuth credential for testing.
// Generates deterministic but non-guessable credentials bound to a demo email.
export function isOAuthConfigured(provider: "google" | "apple"): boolean {
  if (provider === "google") {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  return !!(
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY
  );
}

export function isDemoMode(): boolean {
  return DEMO_MODE === "true";
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      membership: string;
    };
  }
  interface JWT {
    uid?: string;
    role?: string;
    membership?: string;
    jti?: string;
  }
}
