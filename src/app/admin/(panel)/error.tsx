"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

/** Shown when a page can't load: a stale session, a missing record, or a network problem. */
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const text = error.message ?? "";
  const auth = /Not signed in|Not allowed/.test(text);
  const missing = /ArgumentValidationError|Value does not match validator|not found/i.test(text);

  return (
    <div className="admin-empty">
      <h1>{auth ? "Please sign in again" : missing ? "We couldn't find that record" : "Something went wrong"}</h1>
      <p>
        {auth
          ? "Your session has ended or this account can't use the admin panel."
          : missing
            ? "The link may be wrong, or the record no longer exists."
            : "Check your internet connection and try again."}
      </p>
      <div className="admin-empty-actions">
        {auth ? (
          <button className="btn btn-primary" onClick={async () => { await signOut(); router.replace("/admin/login"); }}>
            Go to sign in
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={reset}>Try again</button>
            <Link className="btn btn-outline" href="/admin">Back to inquiries</Link>
          </>
        )}
      </div>
    </div>
  );
}
