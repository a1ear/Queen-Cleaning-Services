"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { QUOTE_PATH } from "@/lib/contact";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 860px)");
    const onResize = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={open ? "close" : "menu"} />
        <span className="visually-hidden">Menu</span>
      </button>
      <nav className={`site-nav${open ? " is-open" : ""}`} id="site-nav" aria-label="Main">
        <ul>
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link className="btn btn-primary btn-sm nav-cta" href={QUOTE_PATH}
          aria-current={pathname === QUOTE_PATH ? "page" : undefined}>
          Request a Quote
        </Link>
      </nav>
    </>
  );
}
