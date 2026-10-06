import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { Benefits, CtaBand, PageHero, SectionHead } from "@/components/sections";

const { about, business: b } = siteConfig;

export const metadata: Metadata = {
  title: "About Us",
  description: about.intro,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={`About ${b.name}`} intro={about.intro} />

      <section className="section section-flush-top" aria-labelledby="story-title">
        <div className="container prose">
          <h2 id="story-title">Our story</h2>
          {about.story.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {about.values.length > 0 && (
        <section className="section section-tint" aria-labelledby="values-title">
          <div className="container">
            <SectionHead id="values-title" eyebrow="What we care about" title="Our values" />
            <ul className="values">
              {about.values.map((v) => <li className="value" key={v.title}><h3>{v.title}</h3><p>{v.text}</p></li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <SectionHead id="why-title" eyebrow="Why choose us" title="What you can expect" />
          <Benefits />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
