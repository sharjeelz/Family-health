"use client";

import { useEffect } from "react";

// Warm at dawn, bright at midday, golden at dusk, cool after dark. The pane
// stays light throughout — the cards on it are dark, so the text contrast must
// not drift. Only the tint moves.
const PHASES = [
  { from: 0, tint1: "rgba(90,110,160,0.10)", tint2: "rgba(60,70,110,0.08)" },   // night
  { from: 5, tint1: "rgba(214,140,90,0.13)", tint2: "rgba(197,107,60,0.09)" },  // dawn
  { from: 9, tint1: "rgba(197,107,60,0.05)", tint2: "rgba(90,132,101,0.06)" },  // day
  { from: 16, tint1: "rgba(214,150,70,0.13)", tint2: "rgba(197,107,60,0.10)" }, // golden hour
  { from: 19, tint1: "rgba(140,110,150,0.12)", tint2: "rgba(90,80,130,0.09)" }, // dusk
  { from: 21, tint1: "rgba(90,110,160,0.10)", tint2: "rgba(60,70,110,0.08)" },  // night
];

function phaseFor(hour) {
  let current = PHASES[0];
  for (const p of PHASES) if (hour >= p.from) current = p;
  return current;
}

export default function AmbientBackground() {
  useEffect(() => {
    const apply = () => {
      const p = phaseFor(new Date().getHours());
      const root = document.documentElement;
      root.style.setProperty("--amb-1", p.tint1);
      root.style.setProperty("--amb-2", p.tint2);
    };
    apply();
    // Nothing here is time-critical; a screen that runs for weeks just needs to
    // keep up with the hour.
    const t = setInterval(apply, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return null;
}
