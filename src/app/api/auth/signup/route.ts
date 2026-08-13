import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { validateEmail, validatePassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim() || null;

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      provider: "credentials",
      providerAccountId: email,
    })
    .returning({ id: users.id, email: users.email });

  return NextResponse.json(
    { user: created, message: "Account created successfully." },
    { status: 201 }
  );
}
