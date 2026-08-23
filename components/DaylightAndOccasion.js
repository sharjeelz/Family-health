"use client";

import { useState, useEffect } from "react";
import { useWeather } from "../lib/useWeather";
import { nextHijriEvents, daysAwayLabel } from "../lib/hijriEvents";
import CardMotif from "./CardMotif";

function to12h(hhmm) {
  if (!hhmm) return null;
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

// Sunrise/sunset and the next Islamic occasion, as two dashboard widgets. Both
// are cheap: the sun times ride along on the weather request, and the countdown
// is computed locally. Rendered as a fragment so they sit as siblings in the
// dashboard grid.
export default function DaylightAndOccasion() {
  const weather = useWeather();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(nextHijriEvents(new Date(), 4));
    // Recheck slowly so the countdown rolls over past midnight on a screen that
    // is never reloaded.
    const t = setInterval(() => setEvents(nextHijriEvents(new Date(), 4)), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // The nearest occasion keeps the prominence it had; the rest follow as a
  // quiet list so the card still reads at a glance from across the kitchen.
  const [next, ...later] = events;

  const sunrise = to12h(weather.sunrise);
  const sunset = to12h(weather.sunset);

  return (
    <>
      <section className="relative overflow-hidden isolate bg-white rounded-3xl shadow-card p-5">
        <CardMotif kind="sun" />
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
          Daylight
        </p>
        {sunrise && sunset ? (
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <p className="text-ink-700/45 text-[0.6rem] font-800 uppercase tracking-wider">
                    Sunrise
                  </p>
                  <p className="text-ink-800 font-800 text-base tabular-nums">{sunrise}</p>
                </div>
              </div>
            </div>
            <div className="w-px self-stretch bg-sand-200 mx-3" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <p className="text-ink-700/45 text-[0.6rem] font-800 uppercase tracking-wider">
                    Sunset
                  </p>
                  <p className="text-ink-800 font-800 text-base tabular-nums">{sunset}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ink-700/50 font-600 text-sm">Loading…</p>
        )}
      </section>

      <section className="relative overflow-hidden isolate bg-white rounded-3xl shadow-card p-5">
        <CardMotif kind="islamic" />
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
          Coming up
        </p>
        {next ? (
          <div className="min-w-0">
            <p className="font-display text-xl font-700 text-ink-800 truncate">{next.name}</p>
            <p className="text-clay-600 text-sm font-800 mt-0.5">{daysAwayLabel(next.daysAway)}</p>

            {later.length > 0 && (
              <ul className="mt-3 pt-3 border-t border-sand-200 space-y-1.5">
                {later.map((e) => (
                  <li key={`${e.name}-${e.daysAway}`} className="flex items-baseline justify-between gap-3">
                    <span className="text-ink-800 font-700 text-sm truncate">{e.name}</span>
                    <span className="text-ink-700/45 font-700 text-xs shrink-0 tabular-nums">
                      {daysAwayLabel(e.daysAway)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-ink-700/50 font-600 text-sm">—</p>
        )}
      </section>
    </>
  );
}
