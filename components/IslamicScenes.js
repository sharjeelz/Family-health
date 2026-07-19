"use client";

// Built-in Islamic art scenes shown on the Home tab when no family photos have
// been added yet. Drawn as inline SVG (16:10) so they need no external files,
// never 404, and work offline. Palette matches the app theme.

function MosqueDusk() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sc-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9552C" />
          <stop offset="0.5" stopColor="#D98C5F" />
          <stop offset="1" stopColor="#F5EFE4" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#sc-dusk)" />
      <circle cx="200" cy="175" r="48" fill="#F5B841" opacity="0.9" />
      <g fill="#241C12">
        {/* minarets */}
        {[110, 290].map((x) => (
          <g key={x}>
            <rect x={x - 5} y="95" width="10" height="130" />
            <path d={`M${x} 78 L${x + 8} 95 L${x - 8} 95 Z`} />
            <circle cx={x} cy="74" r="5" fill="#F5B841" />
          </g>
        ))}
        {/* main building */}
        <rect x="145" y="150" width="110" height="75" />
        {/* dome */}
        <path d="M145 150 Q200 78 255 150 Z" />
        <rect x="197" y="60" width="6" height="20" />
        <circle cx="200" cy="56" r="6" fill="#F5B841" />
        {/* arched door + windows */}
        <path d="M185 225 L185 188 Q200 170 215 188 L215 225 Z" fill="#120D08" />
        <circle cx="165" cy="180" r="7" fill="#120D08" />
        <circle cx="235" cy="180" r="7" fill="#120D08" />
      </g>
      <rect y="222" width="400" height="28" fill="#1E1810" />
    </svg>
  );
}

function CrescentNight() {
  const stars = [
    [40, 40], [90, 70], [150, 35], [250, 55], [320, 90], [360, 45], [200, 90], [280, 30],
  ];
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sc-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1810" />
          <stop offset="1" stopColor="#456B4F" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#sc-night)" />
      {stars.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 4} L${x + 1.4} ${y - 1.4} L${x + 4} ${y} L${x + 1.4} ${y + 1.4} L${x} ${y + 4} L${x - 1.4} ${y + 1.4} L${x - 4} ${y} L${x - 1.4} ${y - 1.4} Z`}
          fill="#F0EADD"
          opacity={0.85}
        />
      ))}
      {/* crescent */}
      <g>
        <circle cx="310" cy="60" r="30" fill="#F5B841" />
        <circle cx="322" cy="52" r="26" fill="#1E1810" />
      </g>
      {/* skyline silhouette */}
      <g fill="#141009">
        <rect x="0" y="200" width="400" height="50" />
        {[60, 200, 330].map((x) => (
          <g key={x}>
            <rect x={x - 30} y="165" width="60" height="45" />
            <path d={`M${x - 30} 165 Q${x} 128 ${x + 30} 165 Z`} />
            <circle cx={x} cy="120" r="4" fill="#F5B841" />
            <rect x={x - 1.5} y="122" width="3" height="10" />
          </g>
        ))}
        {[20, 380].map((x) => (
          <rect key={x} x={x - 4} y="150" width="8" height="60" />
        ))}
      </g>
    </svg>
  );
}

function Geometry() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="sc-geo" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill="#FBF8F3" />
          <g transform="translate(28 28)" fill="none" strokeWidth="2">
            <rect x="-17" y="-17" width="34" height="34" stroke="#C56B3C" opacity="0.55" />
            <rect x="-17" y="-17" width="34" height="34" stroke="#5A8465" opacity="0.55" transform="rotate(45)" />
            <circle r="4" fill="#C56B3C" stroke="none" opacity="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="400" height="250" fill="url(#sc-geo)" />
      {/* center medallion */}
      <g transform="translate(200 125)" fill="none" strokeWidth="2.5">
        <circle r="52" stroke="#A9552C" opacity="0.7" />
        <rect x="-34" y="-34" width="68" height="68" stroke="#456B4F" opacity="0.75" />
        <rect x="-34" y="-34" width="68" height="68" stroke="#A9552C" opacity="0.75" transform="rotate(45)" />
        <circle r="8" fill="#C56B3C" stroke="none" />
      </g>
    </svg>
  );
}

function Lantern() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sc-lbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#243D2C" />
          <stop offset="1" stopColor="#1E1810" />
        </linearGradient>
        <radialGradient id="sc-glow">
          <stop offset="0" stopColor="#F5B841" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F5B841" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#sc-lbg)" />
      <circle cx="200" cy="135" r="95" fill="url(#sc-glow)" />
      <g stroke="#F5B841" strokeWidth="2.5" fill="none">
        {/* cord */}
        <line x1="200" y1="20" x2="200" y2="52" />
        {/* top cap */}
        <path d="M182 66 Q200 44 218 66 Z" fill="#F5B841" />
        <rect x="196" y="52" width="8" height="8" fill="#F5B841" stroke="none" />
        {/* body */}
        <path d="M172 72 L228 72 L236 150 Q200 172 164 150 Z" fill="#C56B3C" fillOpacity="0.25" />
        {/* body ribs */}
        <line x1="186" y1="72" x2="182" y2="156" />
        <line x1="200" y1="72" x2="200" y2="164" />
        <line x1="214" y1="72" x2="218" y2="156" />
        <line x1="168" y1="112" x2="232" y2="112" />
        {/* bottom finial */}
        <path d="M188 152 L212 152 L200 172 Z" fill="#F5B841" stroke="none" />
        {/* crescent on top */}
      </g>
      <g transform="translate(200 34)">
        <circle r="9" fill="#F5B841" />
        <circle cx="4" cy="-2" r="7.5" fill="#243D2C" />
      </g>
    </svg>
  );
}

export const SCENES = [
  { id: "dusk", caption: "As-salamu ‘alaykum", Comp: MosqueDusk },
  { id: "night", caption: "SubhanAllah", Comp: CrescentNight },
  { id: "geo", caption: "Islamic geometry", Comp: Geometry },
  { id: "lantern", caption: "Ramadan Kareem", Comp: Lantern },
];
