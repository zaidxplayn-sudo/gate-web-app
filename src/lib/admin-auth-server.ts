import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE = "gate_admin_session";
const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "gate-admin-dev-secret"
);

export async function createAdminToken(payload: {
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<{
  email: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") return null;
    return { email: payload.email as string, role: payload.role };
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;

// Private admin login — never linked from the public frontend.
export async function adminLogin(email: string, password: string) {
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/schema");
  const { eq } = await import("drizzle-orm");
  const { verifyPassword } = await import("@/lib/password");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || user.role !== "admin" || !user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { email: user.email, role: user.role };
}
