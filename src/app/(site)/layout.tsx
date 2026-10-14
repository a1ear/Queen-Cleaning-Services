import { isDemo } from "@/site.config";
import { DemoBadge, DemoBar, SiteFooter, SiteHeader } from "@/components/SiteChrome";

/** Public website chrome. The admin panel has its own layout. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      {isDemo && <DemoBar />}
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
      {isDemo && <DemoBadge />}
    </>
  );
}
