import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { QUOTE_PATH, addressLines, socialLinks, telHref } from "@/lib/contact";
import { Icon } from "@/components/Icon";
import { Hours, PageHero } from "@/components/sections";

const { business: b } = siteConfig;

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${b.name}: phone, email, address, and opening hours. Or request a laundry quote online.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch"
        intro="Call, text, or message us, or visit the shop during opening hours. For a quotation, the quickest way is our online form." />

      <section className="section section-flush-top" aria-label="Contact details">
        <div className="container contact-grid">
          <ul className="contact-cards">
            <li className="contact-card">
              <span className="icon-badge"><Icon name="phone" /></span>
              <div><h2>Call or text</h2><p><a href={telHref(b.phone)}>{b.phone}</a></p></div>
            </li>
            <li className="contact-card">
              <span className="icon-badge"><Icon name="mail" /></span>
              <div><h2>Email</h2><p><a href={`mailto:${b.email}`}>{b.email}</a></p></div>
            </li>
            {socialLinks().map((s) => (
              <li className="contact-card" key={s.label}>
                <span className="icon-badge"><Icon name={s.icon} /></span>
                <div><h2>{s.label}</h2><p><a href={s.url} rel="noopener" target="_blank">Message us on {s.label}</a></p></div>
              </li>
            ))}
            <li className="contact-card">
              <span className="icon-badge"><Icon name="pin" /></span>
              <div>
                <h2>Visit us</h2>
                <address>{addressLines(b.address).map((line, i) => <span key={i} className="line">{line}</span>)}</address>
                {b.mapsUrl && (
                  <p><a className="link-arrow" href={b.mapsUrl} rel="noopener" target="_blank">Open in Google Maps <Icon name="arrow" /></a></p>
                )}
              </div>
            </li>
          </ul>

          <aside className="panel" aria-labelledby="hours-title">
            <h2 id="hours-title"><Icon name="clock" /> Opening hours</h2>
            <Hours />
            <div className="panel-cta">
              <p>Need a quotation?</p>
              <Link className="btn btn-primary btn-block" href={QUOTE_PATH}>Request a Quote</Link>
            </div>
          </aside>
        </div>

        {b.mapEmbedUrl && (
          <div className="container">
            <div className="map">
              <iframe src={b.mapEmbedUrl} title={`Map showing the location of ${b.name}`} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
