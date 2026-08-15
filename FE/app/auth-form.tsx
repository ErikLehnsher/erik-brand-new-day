"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setSession } from "./session";

type AuthMode = "login" | "register";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch(`${API_BASE}/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data: { detail?: string; access_token?: string; user?: { id: string; email: string; display_name: string } } =
        await response.json().catch(() => ({}));
      if (!response.ok || !data.access_token || !data.user) {
        throw new Error(data.detail ?? "Auth request failed");
      }

      setSession({ accessToken: data.access_token, user: data.user });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown auth error");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Welcome back." : "Create your account.";
  const subtitle =
    mode === "login"
      ? "Sign in with email and password, or continue with Google once the OAuth flow is fully wired up."
      : "Set up your account with email and password, then move into the blog and daily experience.";

  return (
    <main className="page">
      <section className="hero hero-auth">
        <div className="auth-copy">
          <p className="eyebrow">Account access</p>
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Your password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            <span className="button-icon button-icon-frame" aria-hidden="true">
              <Image src={mode === "login" ? "/brand/header-cat.png" : "/brand/header-dog.png"} alt="" fill sizes="18px" className="button-icon-image" />
            </span>
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <button className="secondary-button" type="button" disabled>
            <span className="button-icon button-icon-frame" aria-hidden="true">
              <Image src="/brand/header-dog.png" alt="" fill sizes="18px" className="button-icon-image" />
            </span>
            Continue with Google
          </button>

          <a className="text-link" href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
          </a>
        </form>
      </section>
    </main>
  );
}
