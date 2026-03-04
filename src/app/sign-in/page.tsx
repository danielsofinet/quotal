"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithGoogle,
  handleRedirectResult,
  sendMagicLink,
  completeMagicLink,
} from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle redirect result (Google sign-in fallback) and magic link completion
  useEffect(() => {
    // Check for Google redirect result
    handleRedirectResult()
      .then((user) => {
        if (user) router.push("/dashboard");
      })
      .catch(() => {});

    // Check for magic link completion
    const params = new URLSearchParams(window.location.search);
    if (params.get("finishSignIn") === "true") {
      completeMagicLink()
        .then((user) => {
          if (user) router.push("/dashboard");
        })
        .catch((err) => setError(err.message));
    }
  }, [router]);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendMagicLink(email.trim());
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <h1 className="text-2xl font-semibold">Sign in to Quotal</h1>
          <p className="text-text-muted text-sm mt-2">
            AI-powered vendor quote comparison
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-danger-dim border border-danger/20 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <Button
          onClick={handleGoogle}
          variant="secondary"
          loading={loading}
          className="w-full justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Sign in with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-dim">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Magic Link */}
        {magicLinkSent ? (
          <div className="text-center p-4 bg-surface border border-border rounded-lg">
            <p className="text-sm text-text-primary font-medium mb-1">
              Check your email
            </p>
            <p className="text-xs text-text-muted">
              We sent a sign-in link to{" "}
              <span className="font-medium text-text-primary">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            <Button
              type="submit"
              loading={loading}
              disabled={!email.trim()}
              className="w-full justify-center"
            >
              Send sign-in link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
