import Link from "next/link";
import { siteConfig, type Service } from "@/site.config";
import { QUOTE_PATH } from "@/lib/contact";
import { Icon } from "./Icon";

export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHead({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="section-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export function CtaBand({
  title = "Need a laundry quote?",
  text = "Tell us what you need and we'll get back to you.",
}: { title?: string; text?: string }) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container cta-inner">
        <div>
          <h2 id="cta-title">{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="btn btn-sun btn-lg" href={QUOTE_PATH}>
          Request a Quote <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}

export function ServiceCard({ service, full = false }: { service: Service; full?: boolean }) {
  return (
    <li className={`service-card${full ? " service-card-full" : ""}`} id={service.id}>
      <span className="icon-badge"><Icon name={service.icon} /></span>
      <h3>{service.name}</h3>
      <p>{full ? service.description : service.summary}</p>
      {full && (
        <div className="service-foot">
          <p className={`price${service.price ? "" : " price-ask"}`}>
            <span className="visually-hidden">Price: </span>
            {service.price ?? "Ask for a quote"}
          </p>
          <Link className="link-arrow" href={`${QUOTE_PATH}?service=${encodeURIComponent(service.id)}`}>
            Request this service<span className="visually-hidden">: {service.name}</span> <Icon name="arrow" />
          </Link>
        </div>
      )}
    </li>
  );
}

export function Benefits() {
  return (
    <ul className="benefits">
      {siteConfig.benefits.map((b) => (
        <li className="benefit" key={b.title}>
          <span className="icon-badge icon-badge-soft"><Icon name={b.icon} /></span>
          <div>
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Hours({ className = "hours" }: { className?: string }) {
  return (
    <dl className={className}>
      {siteConfig.business.hours.map((h) => (
        <div key={h.days}>
          <dt>{h.days}</dt>
          <dd>{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}
