"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes, nextPrayer } from "../lib/usePrayerTimes";
import CardMotif from "./CardMotif";

// "HH:MM" (24h, as Aladhan returns it) -> "6:42 PM", to match the hero clock.
function to12h(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

// The strip gives each prayer a fifth of the card, so the meridiem is dropped
// there — prayer times are unambiguous by position.
function shortTime(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")}`;
}

function countdownLabel(next) {
  if (next.hours > 0) return `in ${next.hours}h ${next.minutes}m`;
  if (next.minutes > 0) return `in ${next.minutes} min`;
  return "now";
}

// Next-prayer widget. Reads the same cached Umm al-Qura times as the Deen tab
// and the azaan alert.
export default function NextPrayerCard() {
  const { status, times, city } = usePrayerTimes();
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

  // Under 15 minutes counts as "soon" — worth catching the eye from across the
  // room, but a slow breath rather than anything urgent.
  const soon = next && next.hours === 0 && next.minutes <= 15;

  return (
    <section
      className={`relative overflow-hidden isolate bg-white rounded-3xl shadow-card p-5 ${soon ? "pulse-soon" : ""}`}
    >
      <CardMotif kind="prayer" />
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em]">
          Next prayer
        </p>
        {city && (
          <span className="text-ink-700/40 font-600 text-[0.65rem] truncate">{city}</span>
        )}
      </div>

      {status === "loading" && !next && (
        <p className="text-ink-700/50 font-600 text-sm">Loading…</p>
      )}
      {status === "error" && !next && (
        <p className="text-ink-700/50 font-600 text-sm">Prayer times unavailable</p>
      )}

      {next && (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-700 text-ink-800 truncate">
              {next.nextName}
            </span>
            <span className="text-ink-800 font-800 text-lg tabular-nums shrink-0">
              {to12h(time)}
            </span>
          </div>
          <p className="text-clay-600 text-sm font-800 mt-1">{countdownLabel(next)}</p>

          {/* The whole day: where we are in it, and every prayer's time. This is
              the only place the full timetable lives now. */}
          <div className="flex items-end gap-1.5 mt-4">
            {times.map((p, i) => {
              const done = i < next.activeIndex;
              const isNext = i === next.activeIndex;
              return (
                <div key={p.name} className="flex-1 min-w-0 text-center">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isNext ? "bg-clay-500" : done ? "bg-sage-400" : "bg-sand-200"
                    }`}
                  />
                  <span
                    className={`block text-[0.65rem] font-800 mt-1.5 truncate ${
                      isNext ? "text-clay-600" : done ? "text-sage-600" : "text-ink-700/35"
                    }`}
                  >
                    {p.name.slice(0, 3)}
                  </span>
                  <span
                    className={`block text-[0.6rem] font-700 tabular-nums truncate ${
                      isNext ? "text-clay-600" : done ? "text-ink-700/35" : "text-ink-700/45"
                    }`}
                  >
                    {shortTime(p.time)}
                  </span>
                </div>
              );
            })}
          </div>
         
        </>
      )}
    </section>
  );
}
