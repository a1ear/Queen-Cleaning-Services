// Line icons (24×24, drawn in currentColor). Always decorative: every icon sits
// next to a text label, so screen readers skip them.

const PATHS = {
  home: <><path d="M3.5 11 12 4l8.5 7" /><path d="M5.5 9.8V20h13V9.8" /><path d="M10 20v-5.5h4V20" /></>,
  building: <><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01" /><path d="M10 20.5v-4h4v4" /></>,
  spray: <><path d="M8 12.5h7V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" /><path d="M9.5 12.5V9h5l2-1.5M12 9V6.5h3" /><path d="M19 6.5h.01M20.5 9h.01M19 11.5h.01" /></>,
  hammer: <><path d="m14 9-9.2 9.2a1.5 1.5 0 0 0 2.1 2.1L16 11" /><path d="M13 5.5 17.5 10l3-3-3.5-3.5a2 2 0 0 0-2.8 0z" /></>,
  sofa: <><path d="M5 11V8.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V11" /><path d="M3.5 12.5a1.5 1.5 0 0 1 3 0V14h11v-1.5a1.5 1.5 0 0 1 3 0V17a1 1 0 0 1-1 1h-16a1 1 0 0 1-1-1z" /><path d="M6 18v2M18 18v2" /></>,
  box: <><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></>,
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
      <path d="m18 11 2.8 7.7 7.7 2.8-7.7 2.8L18 32l-2.8-7.7-7.7-2.8 7.7-2.8z" fill="#fff" />
    </svg>
  );
}
