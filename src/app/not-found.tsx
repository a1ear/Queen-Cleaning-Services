import type { Metadata } from "next";
import Link from "next/link";
import { QUOTE_PATH } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <p className="eyebrow">Error 404</p>
        <h1>We couldn&apos;t find that page</h1>
        <p className="lead">The link may be old or mistyped. Here are some places to go instead.</p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-lg" href="/">Back to Home</Link>
          <Link className="btn btn-outline btn-lg" href={QUOTE_PATH}>Request a Quote</Link>
        </div>
      </div>
    </section>
  );
}
