import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { Icon } from "@/components/Icon";
import { CtaBand, PageHero, ServiceCard } from "@/components/sections";

export const metadata: Metadata = {
  title: "Cleaning Services & Pricing",
  description: `Cleaning services from ${siteConfig.business.name} in ${siteConfig.business.serviceArea}: ${siteConfig.services.map((s) => s.name).join(", ")}. See prices and request our services.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services & pricing" title="Our cleaning services"
        intro="Choose the service that fits your space. Not sure which one you need? Send a request and we'll help you pick." />
      <section className="section section-flush-top" aria-labelledby="all-services">
        <div className="container">
          <h2 id="all-services" className="visually-hidden">All services and prices</h2>
          <ul className="service-grid service-grid-full">
            {siteConfig.services.map((s) => <ServiceCard key={s.id} service={s} full />)}
          </ul>
          <p className="note"><Icon name="alert" /><span>{siteConfig.pricingNote}</span></p>
        </div>
      </section>
      <CtaBand title="Not sure what you need?" text="Describe your space and we'll recommend a service and send you a quote." />
    </>
  );
}
