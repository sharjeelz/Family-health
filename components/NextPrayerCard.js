"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes, nextPrayer } from "../lib/usePrayerTimes";

// "HH:MM" (24h, as Aladhan returns it) -> "6:42 PM", to match the hero clock.
function to12h(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

function countdownLabel(next) {
  if (next.hours > 0) return `in ${next.hours}h ${next.minutes}m`;
  if (next.minutes > 0) return `in ${next.minutes} min`;
  return "now";
}

// Next-prayer widget for the rail. Reads the same cached Umm al-Qura times as
// the Deen tab and the azaan alert.
export default function NextPrayerCard() {
  const { status, times } = usePrayerTimes();
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    // The countdown only shows minutes, so there is nothing to gain from a
    // once-a-second tick on an always-on screen.
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const next = times && now ? nextPrayer(times, now) : null;
  const time = next && times ? times[next.activeIndex].time : null;

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2.5 mt-3">
      <span className="text-2xl leading-none shrink-0" aria-hidden="true">
        🕌
      </span>
      <div className="min-w-0 flex-1">
        {status === "loading" && !next && (
          <span className="text-sand-200/70 text-sm">Loading…</span>
        )}
        {status === "error" && !next && (
          <span className="text-sand-200/70 text-xs">Prayer times unavailable</span>
        )}
        {next && (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-lg font-700 leading-none truncate">
                {next.nextName}
              </span>
              <span className="text-sand-100 font-700 text-sm tabular-nums shrink-0">
                {to12h(time)}
              </span>
            </div>
            <p className="text-sage-400 text-xs font-700 mt-1">{countdownLabel(next)}</p>
          </>
        )}
      </div>
    </div>
  );
}
