/** Hero illustration: a spray bottle misting a sparkle, next to a bucket of suds. */
export function CleaningArt() {
  return (
    <svg className="hero-svg" viewBox="0 0 360 420" aria-hidden="true" focusable="false">
      <ellipse cx="180" cy="406" rx="140" ry="9" fill="#0d2633" opacity=".08" />
      <circle cx="180" cy="228" r="150" fill="#e3f3f1" />

      {/* Bucket */}
      <path d="M62 282h124l-13 104a10 10 0 0 1-10 9H85a10 10 0 0 1-10-9z" fill="#ffd166" stroke="#e0aa2e" strokeWidth="3" />
      <rect x="56" y="272" width="136" height="16" rx="8" fill="#f5bd2f" />
      <path d="M72 276c0-52 104-52 104 0" fill="none" stroke="#0b7a75" strokeWidth="7" strokeLinecap="round" />
      <rect x="84" y="318" width="80" height="26" rx="13" fill="#fff" opacity=".55" />
      <g className="suds" fill="#fff" stroke="#0b7a75" strokeWidth="2.5">
        <circle className="s1" cx="96" cy="266" r="13" />
        <circle className="s2" cx="124" cy="256" r="17" />
        <circle className="s3" cx="154" cy="264" r="12" />
        <circle className="s4" cx="112" cy="238" r="8" />
        <circle className="s5" cx="142" cy="236" r="6" />
      </g>

      {/* Spray bottle */}
      <rect x="216" y="236" width="88" height="160" rx="24" fill="#fff" stroke="#0b7a75" strokeWidth="5" />
      <rect x="226" y="296" width="68" height="90" rx="16" fill="#0b7a75" opacity=".18" />
      <rect x="234" y="304" width="52" height="52" rx="12" fill="#0b7a75" />
      <path d="m260 313 3.4 9.6 9.6 3.4-9.6 3.4-3.4 9.6-3.4-9.6-9.6-3.4 9.6-3.4z" fill="#fff" />
      <rect x="244" y="214" width="32" height="26" rx="6" fill="#06312f" />
      <path d="M238 214v-34a12 12 0 0 1 12-12h46a10 10 0 0 1 10 10v36z" fill="#0b7a75" />
      <rect x="208" y="180" width="32" height="16" rx="6" fill="#06312f" />
      <path d="M306 198q18 3 20 28l-13 3q-2-17-7-19z" fill="#06312f" />
      <rect x="256" y="178" width="30" height="8" rx="4" fill="#fff" opacity=".35" />

      {/* Mist */}
      <g className="mist" fill="#0b7a75">
        <circle className="m1" cx="190" cy="188" r="5" />
        <circle className="m2" cx="172" cy="180" r="4" />
        <circle className="m3" cx="174" cy="198" r="3.5" />
        <circle className="m4" cx="154" cy="190" r="3" />
        <circle className="m5" cx="152" cy="174" r="2.5" />
      </g>

      {/* Sparkles */}
      <path className="sparkle sp1" d="m118 128 6.5 17.5 17.5 6.5-17.5 6.5-6.5 17.5-6.5-17.5-17.5-6.5 17.5-6.5z" fill="#ffd166" />
      <path className="sparkle sp2" d="m72 190 3.8 10.2 10.2 3.8-10.2 3.8-3.8 10.2-3.8-10.2-10.2-3.8 10.2-3.8z" fill="#fff" stroke="#0b7a75" strokeWidth="2" />
      <path className="sparkle sp3" d="m300 112 4.6 12.4 12.4 4.6-12.4 4.6-4.6 12.4-4.6-12.4-12.4-4.6 12.4-4.6z" fill="#fff" stroke="#0b7a75" strokeWidth="2" />
    </svg>
  );
}
