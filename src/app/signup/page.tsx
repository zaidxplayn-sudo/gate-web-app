"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuthScreen from "@/components/auth/AuthScreen";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account created, but sign in failed. Please sign in manually.");
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Create your Gate account"
      subtitle="Join the knowledge ecosystem across IPN, IGC, IFR and ISR."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-bold text-[#9a6d35]">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        OR
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>
      <form onSubmit={submit} className="grid gap-3">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
        />
        <input
          type="password"
          required
          placeholder="Password (min 8 chars, letters + numbers)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Create Account with Email
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-zinc-400">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </AuthScreen>
  );
}
