import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/tokens";
import { validatePassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = body.token ?? "";
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json(
      { error: "Missing or invalid reset token." },
      { status: 400 }
    );
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Invalidate the token (single-use)
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, record.id));

  return NextResponse.json({ message: "Password reset successful." });
}
