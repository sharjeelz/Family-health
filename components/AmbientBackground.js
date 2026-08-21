"use client";

import { useEffect } from "react";

// Warm at dawn, bright at midday, golden at dusk, cool after dark. Drives both
// the pane wash and the rail glow. The pane stays light throughout — the text on
// it is dark, so contrast must not drift. Only the tint moves.
const PHASES = [
  // hour, pane tints, and the rail's two glow stops
  { from: 0,  t1: "rgba(84,104,160,0.26)",  t2: "rgba(56,66,112,0.22)",  r1: "rgba(90,110,180,0.35)",  r2: "rgba(60,70,120,0.30)" },  // night
  { from: 5,  t1: "rgba(224,138,80,0.30)",  t2: "rgba(206,104,58,0.24)", r1: "rgba(230,140,80,0.45)",  r2: "rgba(190,100,70,0.32)" },  // dawn
  { from: 9,  t1: "rgba(197,107,60,0.18)",  t2: "rgba(90,132,101,0.22)", r1: "rgba(197,107,60,0.35)",  r2: "rgba(90,132,101,0.30)" },  // day
  { from: 16, t1: "rgba(226,152,62,0.30)",  t2: "rgba(203,104,52,0.26)", r1: "rgba(235,155,60,0.45)",  r2: "rgba(200,100,55,0.34)" },  // golden hour
  { from: 19, t1: "rgba(142,104,158,0.28)", t2: "rgba(88,76,136,0.24)",  r1: "rgba(150,110,170,0.40)", r2: "rgba(85,75,140,0.32)" },   // dusk
  { from: 21, t1: "rgba(84,104,160,0.26)",  t2: "rgba(56,66,112,0.22)",  r1: "rgba(90,110,180,0.35)",  r2: "rgba(60,70,120,0.30)" },  // night
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
      root.style.setProperty("--amb-1", p.t1);
      root.style.setProperty("--amb-2", p.t2);
      root.style.setProperty("--amb-rail-1", p.r1);
      root.style.setProperty("--amb-rail-2", p.r2);
    };
    apply();
    // Nothing here is time-critical; a screen that runs for weeks just needs to
    // keep up with the hour.
    const t = setInterval(apply, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return null;
}
