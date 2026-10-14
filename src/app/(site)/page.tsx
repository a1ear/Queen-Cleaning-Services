import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { QUOTE_PATH, telHref } from "@/lib/contact";
import { Icon } from "@/components/Icon";
import { CleaningArt } from "@/components/CleaningArt";
import { Benefits, CtaBand, SectionHead, ServiceCard } from "@/components/sections";

const { business: b } = siteConfig;

export const metadata: Metadata = {
  description: `${b.description} House, office, deep, and post-construction cleaning. Request a free quote online.`,
  alternates: { canonical: "/" },
};

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: b.name,
    description: b.description,
    url: `${siteConfig.siteUrl}/`,
    telephone: b.phone,
    email: b.email,
    address: { "@type": "PostalAddress", ...b.address },
    areaServed: b.serviceArea ? { "@type": "City", name: b.serviceArea } : undefined,
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
            <p className="eyebrow">{b.serviceArea ? `Cleaning services in ${b.serviceArea}` : "Professional cleaning services"}</p>
            <h1>{line1} <span className="hero-accent">{line2}</span></h1>
            <p className="lead">{b.description}</p>
            <div className="cta-row">
              <Link className="btn btn-primary btn-lg" href={QUOTE_PATH}>Request Services</Link>
              <Link className="btn btn-outline btn-lg" href="/services">View Services</Link>
            </div>
            <p className="hero-call">Prefer to talk? Call or text <a href={telHref(b.phone)}>{b.phone}</a></p>
          </div>
          <div className="hero-art"><CleaningArt /></div>
        </div>
      </section>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <SectionHead id="services-title" eyebrow="What we do" title="Cleaning for every space" />
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
          <SectionHead id="why-title" eyebrow="Why choose us" title="Cleaning done the way you'd do it yourself" />
          <Benefits />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <SectionHead id="how-title" eyebrow="How it works"
            title={`From request to a fresh, clean space in ${siteConfig.steps.length} steps`} />
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
