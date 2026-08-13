import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    // Google OAuth OIDC
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),

    // Apple Sign in with Apple
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      teamId: process.env.APPLE_TEAM_ID!,
      redirectUri: process.env.APPLE_REDIRECT_URI,
    }),

    // Email/password credentials
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Find user by email
        const userEmail = credentials?.email as string;
        // In a real implementation, we'd check the database
        // For now, this is a prototype
        if (userEmail) {
          return { id: userEmail, email: userEmail } as any;
        }
        return null;
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Check if user already exists in database
      try {
        // If Google or Apple, check if user exists by email
        if (account) {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users, account.email ?? ""))
            .limit(1);

          if (existingUser.length === 0) {
            // Create new user
            await db.insert(users).values({
              email: account.email ?? "",
              name: user.name ?? "",
              image: user.image ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Error in signIn callback:", error);
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      // Persist user data in JWT
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      // Send data to the client session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },

  // Pages
  pages: {
    signIn: "/signin",
    signUp: "/signup",
    error: "/auth-error",
    newUser: "/onboarding",
  },

  // Secret for cryptographic signatures
  secret: process.env.NEXTAUTH_SECRET,
});

// Export types for use in components
export type NextAuthSession = ReturnType<typeof auth>;

// Export helper functions
export { signIn, signOut, auth };