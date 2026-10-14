"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Icon";
import { siteConfig } from "@/site.config";

type Mode = "signIn" | "signUp";

export default function AdminLoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    if (mode === "signUp" && data.get("password") !== data.get("confirm")) {
      setError("The two passwords don't match.");
      return;
    }
    data.delete("confirm");
    data.set("flow", mode);
    setBusy(true);
    setError("");
    try {
      await signIn("password", data);
      router.replace("/admin");
    } catch (err) {
      const text = String((err as Error)?.message ?? "");
      setError(
        mode === "signUp" && /12 characters/.test(text)
          ? "Use at least 12 characters for the password."
          : mode === "signUp" && /already exists/i.test(text)
            ? "The admin account already exists. Sign in instead."
            : "Invalid email or password.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <div className="login-brand">
          <LogoMark />
          <div>
            <p className="login-business">{siteConfig.business.name}</p>
            <h1>{mode === "signIn" ? "Admin sign in" : "Create the admin password"}</h1>
          </div>
        </div>

        {mode === "signUp" && (
          <p className="login-help">
            First-time setup. Use the admin email set for this site, and choose a password of at least 12 characters.
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={mode === "signUp" ? 12 : undefined}
          autoComplete={mode === "signIn" ? "current-password" : "new-password"} />

        {mode === "signUp" && (
          <>
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </>
        )}

        {error && <p className="login-error" role="alert">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Please wait..." : mode === "signIn" ? "Sign in" : "Create password and sign in"}
        </button>

        <button type="button" className="link-button" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(""); }}>
          {mode === "signIn" ? "First-time setup" : "Back to sign in"}
        </button>
      </form>
    </main>
  );
}
