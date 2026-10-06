import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { telHref } from "@/lib/contact";
import { PageHero } from "@/components/sections";

const { business: b } = siteConfig;

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: `How ${b.name} uses the details you send through our quote form.`,
  alternates: { canonical: "/privacy" },
};

// Plain-language notice for the quote form (Data Privacy Act of 2012, RA 10173).
// Have the client confirm the retention period before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy notice" />
      <section className="section section-flush-top">
        <div className="container prose">
          <p>
            When you send a request through our quote form, we collect your name and phone number, and, if you give
            them, your email address, and the address and details of the cleaning you ask about.
          </p>
          <h2>How we use your details</h2>
          <p>
            We use them only to reply to your request, give you a quotation, and arrange the cleaning visit.
            We do not sell your details or use them for advertising.
          </p>
          <h2>Where they are kept</h2>
          <p>
            Requests are saved to a private spreadsheet that only our staff can open. Make.com passes the form to the
            spreadsheet, and Google stores it. Both handle the data on our behalf.
          </p>
          <h2>How long we keep them</h2>
          <p>We keep requests only as long as we need them to serve you, and remove old requests regularly.</p>
          <h2>Your choices</h2>
          <p>
            You can ask us to show, correct, or delete the details we hold about you. Call{" "}
            <a href={telHref(b.phone)}>{b.phone}</a> or email <a href={`mailto:${b.email}`}>{b.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
