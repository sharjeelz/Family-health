"use client";

// A faint motif behind a card, chosen to match what the card is about. Drawn
// as inline SVG so it costs no request, works offline and scales on any
// screen. Deliberately very low contrast: this is texture, not decoration
// competing with the numbers a family reads from across the kitchen.
//
// The parent must be `relative overflow-hidden isolate` — `isolate` creates a
// stacking context so the negative z-index below lands the motif above the
// card's white background but underneath every bit of its content. Without it
// the motif is absolutely positioned and would paint over the text.

function GeometricStar() {
  // An eight-point star built from two squares, tiled — the simplest form of
  // the khatim motif, and the one that survives being shrunk to a corner.
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <defs>
        <pattern id="motif-star" width="60" height="60" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="15" y="15" width="30" height="30" />
            <rect x="15" y="15" width="30" height="30" transform="rotate(45 30 30)" />
            <circle cx="30" cy="30" r="4" />
          </g>
        </pattern>
      </defs>
      <rect width="120" height="120" fill="url(#motif-star)" />
    </svg>
  );
}

function SunRays() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="95" cy="30" r="16" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={95 + Math.cos(a) * 24}
              y1={30 + Math.sin(a) * 24}
              x2={95 + Math.cos(a) * 33}
              y2={30 + Math.sin(a) * 33}
            />
          );
        })}
        <path d="M20 96 Q60 58 100 96" strokeWidth="1.2" opacity="0.7" />
      </g>
    </svg>
  );
}

function Mihrab() {
  // A pointed arch with a lamp — the niche a prayer card belongs in.
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M35 118 L35 60 Q60 22 85 60 L85 118" />
        <path d="M45 118 L45 64 Q60 36 75 64 L75 118" strokeWidth="1.1" opacity="0.75" />
        <path d="M60 30 L60 44" strokeWidth="1.1" />
        <circle cx="60" cy="52" r="7" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

function Cooling() {
  // Drifting air over a snowflake — reads as "cooling" at a glance without
  // needing to be recognised in detail.
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return (
            <g key={i}>
              <line x1="78" y1="38" x2={78 + Math.cos(a) * 26} y2={38 + Math.sin(a) * 26} />
              <line
                x1={78 + Math.cos(a) * 16}
                y1={38 + Math.sin(a) * 16}
                x2={78 + Math.cos(a) * 22 + Math.cos(a + 1.05) * 7}
                y2={38 + Math.sin(a) * 22 + Math.sin(a + 1.05) * 7}
                strokeWidth="1.1"
              />
            </g>
          );
        })}
        <path d="M14 88 Q34 78 54 88 T94 88" strokeWidth="1.2" opacity="0.7" />
        <path d="M14 102 Q34 92 54 102 T94 102" strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

// Unlike the others this one carries its own colours — a birthday card that
// reads in the same single tone as prayer times misses the point. Kept to the
// app palette so it still belongs, and to a corner so it stays a backdrop.
function Celebration() {
  const balloons = [
    { x: 26, y: 44, r: 13, fill: "#D98C5F", string: 76 },
    { x: 58, y: 34, r: 15, fill: "#7BA383", string: 70 },
    { x: 90, y: 48, r: 12, fill: "#C56B3C", string: 80 },
  ];
  const confetti = [
    { x: 14, y: 74, fill: "#7BA383", rot: 20 },
    { x: 40, y: 88, fill: "#D98C5F", rot: -35 },
    { x: 66, y: 78, fill: "#8C5A3C", rot: 50 },
    { x: 96, y: 92, fill: "#5A8465", rot: -15 },
    { x: 78, y: 104, fill: "#C56B3C", rot: 40 },
    { x: 28, y: 104, fill: "#D98C5F", rot: -50 },
  ];
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {balloons.map((b) => (
        <g key={b.x}>
          <path
            d={`M${b.x} ${b.y + b.r} Q${b.x + 5} ${b.y + b.r + 18} ${b.x} ${b.string}`}
            fill="none"
            stroke="#3D3428"
            strokeWidth="1"
            opacity="0.5"
          />
          <ellipse cx={b.x} cy={b.y} rx={b.r} ry={b.r * 1.18} fill={b.fill} />
          <ellipse cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.35} rx={b.r * 0.22} ry={b.r * 0.3} fill="#FBF8F3" opacity="0.5" />
        </g>
      ))}
      {confetti.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width="7"
          height="3.5"
          rx="1.5"
          fill={c.fill}
          transform={`rotate(${c.rot} ${c.x + 3.5} ${c.y + 1.75})`}
        />
      ))}
    </svg>
  );
}

const MOTIFS = {
  islamic: GeometricStar,
  sun: SunRays,
  prayer: Mihrab,
  cooling: Cooling,
  birthday: Celebration,
};

export default function CardMotif({ kind, className = "" }) {
  const Shape = MOTIFS[kind];
  if (!Shape) return null;
  // The single-tone motifs are line work in one colour and need to sit very
  // faint. The celebration one is filled and coloured, so the same opacity
  // would wash it out entirely.
  const opacity = kind === "birthday" ? "opacity-[0.3]" : "opacity-[0.07]";
  return (
    <div
      // Sized larger than the corner it sits in so the pattern runs off the
      // edge rather than ending in a visible seam.
      className={`pointer-events-none absolute -z-10 w-40 h-40 text-clay-500 ${
        kind === "birthday" ? "-right-2 -top-2" : "-right-6 -top-6"
      } ${opacity} ${className}`}
      aria-hidden="true"
    >
      <Shape />
    </div>
  );
}
