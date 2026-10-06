import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { QUOTE_PATH, telHref } from "@/lib/contact";
import { Icon } from "@/components/Icon";
import { WasherArt } from "@/components/WasherArt";
import { Benefits, CtaBand, SectionHead, ServiceCard } from "@/components/sections";

const { business: b } = siteConfig;

export const metadata: Metadata = {
  description: `${b.description} Wash & fold, dry cleaning, pickup and delivery. Request a free quote online.`,
  alternates: { canonical: "/" },
};

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "DryCleaningOrLaundry",
    name: b.name,
    description: b.description,
    url: `${siteConfig.siteUrl}/`,
    telephone: b.phone,
    email: b.email,
    address: { "@type": "PostalAddress", ...b.address },
    ...(b.mapsUrl && { hasMap: b.mapsUrl }),
    ...([b.facebookUrl, b.instagramUrl].some(Boolean) && { sameAs: [b.facebookUrl, b.instagramUrl].filter(Boolean) }),
  };
}

export default function HomePage() {
  const [line1, line2] = b.headline;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c") }}
      />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{b.serviceArea ? `Laundry service in ${b.serviceArea}` : "Your neighborhood laundry"}</p>
            <h1>{line1} <span className="hero-accent">{line2}</span></h1>
            <p className="lead">{b.description}</p>
            <div className="cta-row">
              <Link className="btn btn-primary btn-lg" href={QUOTE_PATH}>Request a Quote</Link>
              <Link className="btn btn-outline btn-lg" href="/services">View Services</Link>
            </div>
            <p className="hero-call">Prefer to talk? Call or text <a href={telHref(b.phone)}>{b.phone}</a></p>
          </div>
          <div className="hero-art"><WasherArt /></div>
        </div>
      </section>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <SectionHead id="services-title" eyebrow="What we do" title="Laundry services for every load" />
          <ul className="service-grid">
            {siteConfig.services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </ul>
          <p className="section-more">
            <Link className="link-arrow" href="/services">See all services and pricing <Icon name="arrow" /></Link>
          </p>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="why-title">
        <div className="container">
          <SectionHead id="why-title" eyebrow="Why choose us" title="Laundry handled the way you'd do it yourself" />
          <Benefits />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <SectionHead id="how-title" eyebrow="How it works"
            title={`From request to fresh laundry in ${siteConfig.steps.length} steps`} />
          <ol className="steps">
            {siteConfig.steps.map((s) => (
              <li className="step" key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
