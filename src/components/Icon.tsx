// Line icons (24×24, drawn in currentColor). Always decorative: every icon sits
// next to a text label, so screen readers skip them.

const PATHS = {
  fold: <><path d="M8.5 4 4 6.6V10l2.8-.9V20h10.4V9.1L20 10V6.6L15.5 4" /><path d="M8.5 4a3.5 3.5 0 0 0 7 0" /><path d="M7 14.5h10" /></>,
  washer: <><rect x="4" y="2.5" width="16" height="19" rx="2.5" /><circle cx="12" cy="13.2" r="5" /><path d="M7.5 6h.01M10.5 6h.01" /><path d="M9.3 14.3c1-.8 1.9.8 2.9 0s1.9.8 2.6 0" /></>,
  hanger: <path d="M10 6a2 2 0 1 1 2 2v1.3l8.2 5.6a1.4 1.4 0 0 1-.8 2.6H4.6a1.4 1.4 0 0 1-.8-2.6L12 9.3" />,
  truck: <><path d="M2.5 6.5h11.5v9H2.5z" /><path d="M14 9.5h3.6l3 3.3v2.7H14" /><circle cx="6.8" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  sparkle: <><path d="m11 3 1.7 4.4 4.4 1.7-4.4 1.7L11 15.2l-1.7-4.4L4.9 9.1l4.4-1.7z" /><path d="m18 14 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  tag: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.7 6.7a1.4 1.4 0 0 1-2 0z" /><circle cx="8" cy="8" r="1.3" /></>,
  timer: <><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.6M9.5 2.5h5" /></>,
  shield: <><path d="M12 3 5 5.8v5.4c0 4.4 3 8.1 7 9.3 4-1.2 7-4.9 7-9.3V5.8z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  smile: <><circle cx="12" cy="12" r="8.5" /><path d="M8.6 14.2a4.3 4.3 0 0 0 6.8 0M9.3 9.6h.01M14.7 9.6h.01" /></>,
  phone: <path d="M5 3.5h3.3l1.6 4.1-2.1 1.3a11 11 0 0 0 5.3 5.3l1.3-2.1 4.1 1.6V17a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 5.7a2 2 0 0 1 2-2.2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  chat: <><path d="M12 3.5c-4.8 0-8.5 3.4-8.5 7.8 0 2.4 1.1 4.5 2.9 6V20.5l2.9-1.6c.9.3 1.8.4 2.7.4 4.8 0 8.5-3.4 8.5-7.9S16.8 3.5 12 3.5z" /><path d="m7.5 13 3-3 2.4 2.2L16.5 9" /></>,
  facebook: <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17l.5-3.5h-3V9a.5.5 0 0 1 .5-.5z" />,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.2 6.8h.01" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2h.01" /></>,
};

export type IconKey = keyof typeof PATHS;

export function Icon({ name, className = "icon" }: { name: IconKey; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}

/** Brand mark: a folded shirt in a bubble. Replace with the client's logo. */
export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="20" fill="var(--brand)" />
      <circle cx="31" cy="9" r="4.5" fill="var(--sun)" />
      <path d="M14.5 12.5 10 15v3.6l2.8-.9V28h14.4V17.7l2.8.9V15l-4.5-2.5a5.5 5.5 0 0 1-11 0z" fill="#fff" />
    </svg>
  );
}
