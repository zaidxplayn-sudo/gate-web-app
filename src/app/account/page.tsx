"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, LogOut, ArrowLeft } from "lucide-react";
import { validatePassword } from "@/lib/validation";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  membership: string;
  provider: string;
  emailVerified: Date | null;
  createdAt: Date | null;
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setName(data.user.name ?? "");
          setImage(data.user.image ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save changes.");
        return;
      }
      setProfile((p) => (p ? { ...p, ...data.user } : p));
      setSuccess("Profile updated.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not change password.");
        return;
      }
      setSuccess("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f0e8] dark:bg-[#090908]">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f0e8] dark:bg-[#090908]">
        <div className="text-center">
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">Session expired.</p>
          <Link href="/signin" className="font-bold text-[#9a6d35]">
            Sign in again
          </Link>
        </div>
      </main>
    );
  }

  const isSocial = profile.provider !== "credentials";

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%)]" />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#9a6d35]"
        >
          <ArrowLeft size={16} /> Back to Gate
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="gate-logo-wrapper cursor-pointer select-none">
            <span className="gate-dot heartbeat" />
            <span className="text-4xl gate-wordmark gate-reveal">Gate</span>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Your account</h1>
            <p className="text-sm text-zinc-500">
              {profile.email}
              {profile.emailVerified ? " · Verified" : ""}
            </p>
          </div>
        </div>

        {success && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <section className="mt-8 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-xl font-semibold">Profile</h2>
          <form onSubmit={saveProfile} className="mt-4 grid gap-3">
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
            />
            <label className="text-sm font-medium">Photo URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
            />
            <button
              type="submit"
              disabled={saving}
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              Save changes
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-xl font-semibold">Security</h2>
          {isSocial ? (
            <p className="mt-3 text-sm text-zinc-500">
              You signed in with {profile.provider === "google" ? "Google" : profile.provider === "apple" ? "Apple" : profile.provider}. Password sign-in is not enabled for this account.
            </p>
          ) : (
            <form onSubmit={changePassword} className="mt-4 grid gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
              />
              <button
                type="submit"
                disabled={pwSaving}
                className="mt-1 flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3.5 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black"
              >
                {pwSaving && <Loader2 className="animate-spin" size={16} />}
                Change password
              </button>
            </form>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="font-serif text-lg font-semibold">Membership</p>
            <p className="text-sm capitalize text-zinc-500">{profile.membership}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
