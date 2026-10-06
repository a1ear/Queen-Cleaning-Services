/** Hero illustration: a front-loading washer with a slowly turning drum. */
export function WasherArt() {
  return (
    <svg className="washer" viewBox="0 0 360 420" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="drum-clip"><circle cx="180" cy="250" r="88" /></clipPath>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2fbfa" />
          <stop offset="1" stopColor="#c6e8e3" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="404" rx="138" ry="10" fill="#0d2633" opacity=".08" />
      <rect x="42" y="40" width="276" height="356" rx="32" fill="#fff" stroke="#cfe3e0" strokeWidth="2" />
      <path d="M42 112V72a32 32 0 0 1 32-32h212a32 32 0 0 1 32 32v40z" fill="#eef7f6" />
      <line x1="42" y1="112" x2="318" y2="112" stroke="#cfe3e0" strokeWidth="2" />
      <rect x="70" y="64" width="78" height="24" rx="12" fill="#0b7a75" opacity=".12" />
      <rect x="80" y="73" width="34" height="6" rx="3" fill="#0b7a75" opacity=".5" />
      <circle cx="238" cy="76" r="15" fill="#fff" stroke="#0b7a75" strokeWidth="3" />
      <path d="M238 76v-9" stroke="#0b7a75" strokeWidth="3" strokeLinecap="round" />
      <circle cx="282" cy="76" r="7" fill="#ffd166" />
      <circle cx="180" cy="250" r="110" fill="#e3f3f1" />
      <circle cx="180" cy="250" r="97" fill="#fff" stroke="#0b7a75" strokeWidth="7" />
      <g clipPath="url(#drum-clip)">
        <rect x="90" y="160" width="180" height="180" fill="url(#glass)" />
        <g className="drum-spin">
          <path d="M118 262c16-30 58-24 66 2s-28 40-52 31-24-19-14-33z" fill="#ffd166" />
          <path d="M186 206c24-16 56-2 57 24s-24 36-45 27-32-35-12-51z" fill="#0b7a75" opacity=".85" />
          <path d="M170 292c14-13 46-10 52 9s-20 27-39 22-25-19-13-31z" fill="#f4978e" />
          <path d="M128 208c10-12 34-10 38 4s-12 22-27 19-18-12-11-23z" fill="#8ecae6" />
        </g>
        <path className="water" d="M60 268q25-12 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0v90H60z" fill="#0b7a75" opacity=".16" />
      </g>
      <ellipse cx="146" cy="204" rx="26" ry="11" fill="#fff" opacity=".7" transform="rotate(-38 146 204)" />
      <rect x="150" y="372" width="60" height="6" rx="3" fill="#cfe3e0" />
      <g className="bubbles" fill="#fff" stroke="#0b7a75" strokeWidth="2.5" opacity=".9">
        <circle className="b1" cx="318" cy="150" r="16" />
        <circle className="b2" cx="340" cy="104" r="9" />
        <circle className="b3" cx="28" cy="190" r="12" />
        <circle className="b4" cx="20" cy="140" r="6" />
      </g>
    </svg>
  );
}
