"use client";

import { useState, useEffect } from "react";
import { useWeather } from "../lib/useWeather";
import { nextHijriEvent, daysAwayLabel } from "../lib/hijriEvents";

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
  const [event, setEvent] = useState(null);

  useEffect(() => {
    setEvent(nextHijriEvent(new Date()));
    // Recheck slowly so the countdown rolls over past midnight on a screen that
    // is never reloaded.
    const t = setInterval(() => setEvent(nextHijriEvent(new Date())), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const sunrise = to12h(weather.sunrise);
  const sunset = to12h(weather.sunset);

  return (
    <>
      <section className="bg-white rounded-3xl shadow-card p-5">
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

      <section className="bg-white rounded-3xl shadow-card p-5">
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
          Coming up
        </p>
        {event ? (
          <div className="min-w-0">
            <div className="min-w-0">
              <p className="font-display text-xl font-700 text-ink-800 truncate">
                {event.name}
              </p>
              <p className="text-clay-600 text-sm font-800 mt-0.5">
                {daysAwayLabel(event.daysAway)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-ink-700/50 font-600 text-sm">—</p>
        )}
      </section>
    </>
  );
}
