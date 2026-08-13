import { NextResponse } from "next/server";
import { adminLogin, createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth-server";
import { validateEmail } from "@/lib/validation";

export const runtime = "nodejs";

// This endpoint is intentionally NOT linked from the public UI.
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!validateEmail(email) || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const admin = await adminLogin(email, password);
  if (!admin) {
    return NextResponse.json(
      { error: "Invalid administrator credentials." },
      { status: 401 }
    );
  }

  const token = await createAdminToken({ email: admin.email, role: admin.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
