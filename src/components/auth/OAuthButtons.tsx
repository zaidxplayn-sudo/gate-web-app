"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{ google: boolean; apple: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const handle = async (provider: "google" | "apple") => {
    setError(null);
    if (config && !config[provider]) {
      setError(
        `${provider === "google" ? "Google" : "Apple"} Sign-In is not configured in this environment. Please set ${
          provider === "google"
            ? "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
            : "APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY"
        } in your .env file.`
      );
      return;
    }
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/account" });
    } catch (err) {
      setError("An error occurred during sign in. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-3">
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 p-4 text-xs font-semibold leading-relaxed text-amber-600 dark:bg-amber-500/5 dark:text-amber-500">
          <AlertCircle className="mt-0.5 shrink-0" size={14} />
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => handle("google")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-3 rounded-full border border-black/15 bg-white px-5 py-3.5 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black"
      >
        {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => handle("apple")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {loading === "apple" ? <Loader2 className="animate-spin" size={18} /> : <AppleIcon />}
        Continue with Apple
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.78c.03 2.83 2.48 3.77 2.51 3.78-.02.07-.4 1.36-1.31 2.69-.79 1.15-1.6 2.3-2.89 2.32-1.26.02-1.67-.74-3.12-.74-1.45 0-1.9.72-3.09.77-1.24.05-2.19-1.25-2.99-2.39-1.62-2.34-2.86-6.62-.12-9.52 1.1-1.71 2.86-2.78 4.6-2.8 1.2-.02 2.34.81 3.08.81.74 0 2.13-1 3.6-.85.61.09 2.33.25 3.43 1.86-3.03 1.82-2.54 6.53.59 7.56Zm-2.6-9.4c.65-.79 1.09-1.88.97-2.97-.94.04-2.08.62-2.76 1.4-.6.69-1.13 1.8-1 2.86 1.05.08 2.12-.53 2.79-1.29Z" />
    </svg>
  );
}
