import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { validateEmail } from "@/lib/validation";

export const runtime = "nodejs";

const RESET_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();

  // Always respond success to avoid leaking account existence.
  if (!validateEmail(email)) {
    return NextResponse.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const raw = generateSecureToken();
    const tokenHash = hashToken(raw);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "https://drzgate.com"}/reset-password?token=${raw}`;
    await sendEmail({
      to: email,
      subject: "Reset your Gate password",
      html: `<p>Hello,</p><p>We received a request to reset your Gate password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">Reset my password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
      text: `Reset your Gate password: ${resetUrl}`,
    });
  }

  return NextResponse.json({
    message:
      "If an account exists for that email, a reset link has been sent.",
  });
}
