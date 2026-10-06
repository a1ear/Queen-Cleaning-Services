import { siteConfig } from "@/site.config";
import type { IconKey } from "@/components/Icon";

export const QUOTE_PATH = "/request-a-quote";

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

type Address = typeof siteConfig.business.address;

export const addressLines = (a: Address) =>
  [a.streetAddress, [a.addressLocality, a.addressRegion].filter(Boolean).join(", "), a.postalCode].filter(Boolean);

/** The business's messaging and social links, skipping empty ones. */
export function socialLinks(b = siteConfig.business) {
  const links: { url: string; label: string; icon: IconKey }[] = [
    { url: b.messengerUrl, label: "Messenger", icon: "chat" },
    { url: b.facebookUrl, label: "Facebook", icon: "facebook" },
    { url: b.instagramUrl, label: "Instagram", icon: "instagram" },
  ];
  return links.filter((l) => l.url);
}
