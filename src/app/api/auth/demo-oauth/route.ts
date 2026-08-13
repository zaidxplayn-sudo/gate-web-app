import { NextResponse } from "next/server";
import { isDemoMode, isOAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Returns whether OAuth credentials are configured for each provider.
// When demo mode is enabled and credentials are missing, the frontend
// uses the google-demo / apple-demo CredentialsProvider fallback.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");

  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Demo mode is not enabled" },
      { status: 403 }
    );
  }

  if (provider === "google") {
    return NextResponse.json({
      configured: isOAuthConfigured("google"),
    });
  }

  if (provider === "apple") {
    return NextResponse.json({
      configured: isOAuthConfigured("apple"),
    });
  }

  return NextResponse.json(
    { error: "Invalid provider" },
    { status: 400 }
  );
}
