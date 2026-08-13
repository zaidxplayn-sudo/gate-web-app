import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";
import { validatePassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      role: users.role,
      membership: users.membership,
      provider: users.provider,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    image?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.image === "string" && body.image.trim()) {
    updates.image = body.image.trim();
  }

  // Password change requires current password verification
  if (body.newPassword) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Password change is unavailable for social accounts." },
        { status: 400 }
      );
    }
    if (!body.currentPassword || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }
    const pwError = validatePassword(body.newPassword);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }
    updates.passwordHash = await hashPassword(body.newPassword);
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id, email: users.email, name: users.name, image: users.image });

  return NextResponse.json({ user: updated, message: "Profile updated." });
}
