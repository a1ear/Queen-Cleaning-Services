import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { telHref } from "@/lib/contact";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/sections";
import { QuoteForm } from "@/components/QuoteForm";

const { business: b, form } = siteConfig;

export const metadata: Metadata = {
  title: "Request a Quote",
  description: `Request a laundry quotation from ${b.name}. Tell us what you need and we'll get back to you. No account needed.`,
  alternates: { canonical: "/request-a-quote" },
};

export default function QuotePage() {
  return (
    <>
      <PageHero eyebrow="Free quotation" title="Request a quote"
        intro="Tell us about your laundry and we'll get back to you with a quotation. No account needed." />

      <section className="section section-flush-top">
        <div className="container quote-grid">
          <div className="form-card">
            <QuoteForm
              services={siteConfig.services.map(({ id, name }) => ({ id, name }))}
              extraServiceOptions={form.extraServiceOptions}
              offersPickupDelivery={form.offersPickupDelivery}
              serviceTypes={form.serviceTypes}
              timeSlots={form.timeSlots}
              amountLabel={form.amountLabel}
              amountHint={form.amountHint}
              phone={b.phone}
              phoneHref={telHref(b.phone)}
              messengerUrl={b.messengerUrl}
            />
          </div>

          <aside className="panel quote-aside" aria-labelledby="next-title">
            <h2 id="next-title">What happens next</h2>
            <ol className="mini-steps">
              <li>We review your request.</li>
              <li>We call or text you with a quotation.</li>
              <li>Once you confirm, we schedule your laundry.</li>
            </ol>
            <div className="panel-cta">
              <p>Prefer to talk?</p>
              <a className="btn btn-outline btn-block" href={telHref(b.phone)}><Icon name="phone" /> Call {b.phone}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
