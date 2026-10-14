"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogoMark } from "@/components/Icon";
import { siteConfig } from "@/site.config";

const NAV = [
  { href: "/admin", label: "Inquiries", match: (p: string) => p === "/admin" || p.startsWith("/admin/inquiries") },
  { href: "/admin/schedule", label: "Schedule", match: (p: string) => p.startsWith("/admin/schedule") },
  { href: "/admin/customers", label: "Customers", match: (p: string) => p.startsWith("/admin/customers") },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const counts = useQuery(api.inquiries.counts);

  async function onSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <div className="admin-top-inner">
          <Link href="/admin" className="admin-brand">
            <LogoMark />
            <span>{siteConfig.business.name} <small>Admin</small></span>
          </Link>
          <nav className="admin-nav" aria-label="Admin">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? "page" : undefined}>
                {item.label}
                {item.href === "/admin" && counts?.New ? <span className="nav-count">{counts.New}</span> : null}
              </Link>
            ))}
          </nav>
          <div className="admin-top-actions">
            <a href="/" target="_blank" rel="noopener" className="admin-link">View website</a>
            <button type="button" className="admin-link" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </header>
      <main className="admin-main" id="main">{children}</main>
    </div>
  );
}
