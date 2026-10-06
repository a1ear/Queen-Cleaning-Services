import Link from "next/link";
import { siteConfig } from "@/site.config";
import { QUOTE_PATH, addressLines, socialLinks, telHref } from "@/lib/contact";
import { Icon, LogoMark } from "./Icon";
import { SiteNav } from "./SiteNav";
import { Hours } from "./sections";

const b = siteConfig.business;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label={`${b.name}, home`}>
          <LogoMark />
          <span className="brand-name">{b.name}</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <LogoMark />
            <span className="brand-name">{b.name}</span>
          </Link>
          <p>{b.description}</p>
          <Link className="btn btn-sun btn-sm" href={QUOTE_PATH}>Request Services</Link>
        </div>
        <div>
          <h2 className="footer-title">Contact</h2>
          <ul className="footer-list">
            <li><a href={telHref(b.phone)}><Icon name="phone" /><span>{b.phone}</span></a></li>
            <li><a href={`mailto:${b.email}`}><Icon name="mail" /><span>{b.email}</span></a></li>
            <li>
              <Icon name="pin" />
              <span>{addressLines(b.address).map((line, i) => <span key={i} className="line">{line}</span>)}</span>
            </li>
            {socialLinks().map((s) => (
              <li key={s.label}>
                <a href={s.url} rel="noopener" target="_blank"><Icon name={s.icon} /><span>{s.label}</span></a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Opening hours</h2>
          <Hours className="hours hours-footer" />
        </div>
        <div>
          <h2 className="footer-title">Pages</h2>
          <ul className="footer-list footer-links">
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href={QUOTE_PATH}>Request Services</Link></li>
            <li><Link href="/privacy">Privacy Notice</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-base">
        <p>&copy; {new Date().getFullYear()} {b.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
