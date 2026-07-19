"use client";

// Small animated SVG weather icons. Animations are defined in globals.css
// and respect prefers-reduced-motion.

export default function WeatherIcon({ icon, size = 56 }) {
  const s = size;
  switch (icon) {
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <g className="wx-spin" style={{ transformOrigin: "32px 32px" }}>
            {[...Array(8)].map((_, i) => (
              <rect key={i} x="31" y="4" width="2" height="9" rx="1" fill="#F5B841"
                transform={`rotate(${i * 45} 32 32)`} />
            ))}
          </g>
          <circle cx="32" cy="32" r="13" fill="#F5B841" />
        </svg>
      );
    case "partly":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="24" cy="24" r="11" fill="#F5B841" className="wx-pulse" />
          <g className="wx-float">
            <ellipse cx="38" cy="40" rx="18" ry="12" fill="#E8E1D3" />
            <ellipse cx="26" cy="42" rx="12" ry="9" fill="#F0EADD" />
          </g>
        </svg>
      );
    case "rain":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <g className="wx-float">
            <ellipse cx="34" cy="26" rx="19" ry="13" fill="#C7CDD4" />
            <ellipse cx="22" cy="28" rx="11" ry="9" fill="#D8DCE1" />
          </g>
          {[10, 26, 42].map((x, i) => (
            <line key={i} x1={22 + x - 10} y1="42" x2={18 + x - 10} y2="54"
              stroke="#5FA8D3" strokeWidth="3" strokeLinecap="round"
              className="wx-rain" style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </svg>
      );
    case "storm":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="34" cy="24" rx="19" ry="13" fill="#9AA3AD" className="wx-float" />
          <polygon points="30,36 40,36 33,48 38,48 26,62 30,50 24,50" fill="#F5B841" className="wx-flash" />
        </svg>
      );
    case "snow":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="34" cy="26" rx="19" ry="13" fill="#DDE3E9" className="wx-float" />
          {[14, 30, 46].map((x, i) => (
            <circle key={i} cx={12 + x} cy="46" r="2.5" fill="#9CC3DD"
              className="wx-rain" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </svg>
      );
    case "fog":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          {[24, 32, 40, 48].map((y, i) => (
            <line key={i} x1="12" y1={y} x2="52" y2={y} stroke="#C8CDD3" strokeWidth="3"
              strokeLinecap="round" className="wx-fog" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </svg>
      );
    case "cloud":
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
          <g className="wx-float">
            <ellipse cx="34" cy="32" rx="20" ry="13" fill="#D8DCE1" />
            <ellipse cx="22" cy="34" rx="12" ry="9" fill="#E4E8EC" />
          </g>
        </svg>
      );
  }
}
