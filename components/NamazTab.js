"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes, nextPrayer } from "../lib/usePrayerTimes";
import { AZAAN_ENABLED_KEY } from "./AzaanManager";
import SurahPlayer from "./SurahPlayer";

const ICONS = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};

function to12h(t) {
  const [hh, mm] = t.split(":").map(Number);
  const ampm = hh < 12 ? "AM" : "PM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export default function NamazTab() {
  const { status, times, city } = usePrayerTimes();
  const [now, setNow] = useState(null);
  const [azaanOn, setAzaanOn] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      setAzaanOn(window.localStorage.getItem(AZAAN_ENABLED_KEY) !== "0");
    } catch {}
  }, []);

  function toggleAzaan() {
    const on = !azaanOn;
    setAzaanOn(on);
    try {
      window.localStorage.setItem(AZAAN_ENABLED_KEY, on ? "1" : "0");
    } catch {}
  }

  const next = times && now ? nextPrayer(times, now) : null;

  return (
    <div className="space-y-5">
      {/* Countdown card */}
      <section className="bg-gradient-to-br from-sage-600 to-sage-500 text-white rounded-3xl shadow-card p-6 text-center">
        {status === "loading" && <p className="py-6 text-white/80">Getting prayer times…</p>}
        {status === "error" && (
          <p className="py-6 text-white/80 text-sm">
            Couldn't load prayer times. Check the connection and reload.
          </p>
        )}
        {status === "ready" && next && (
          <>
            <p className="text-white/75 font-700 text-sm uppercase tracking-wider">Next prayer</p>
            <p className="font-display text-4xl font-700 mt-1">{next.nextName}</p>
            <p className="text-white/90 font-800 text-lg mt-2 tabular-nums">
              in {next.hours > 0 ? `${next.hours}h ` : ""}{next.minutes}m
            </p>
          </>
        )}
      </section>

      {/* Azaan alert settings */}
      <section className="bg-white rounded-3xl shadow-card p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-800 text-ink-800 text-sm flex items-center gap-2">
            <span aria-hidden="true">🔔</span> Azaan alert
          </p>
          <p className="text-xs text-ink-700/50 font-600 mt-0.5">
            Plays the adhan and shows a reminder at each prayer time.
          </p>
        </div>
        <button
          onClick={toggleAzaan}
          role="switch"
          aria-checked={azaanOn}
          aria-label="Toggle azaan alert"
          className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${
            azaanOn ? "bg-sage-500" : "bg-sand-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              azaanOn ? "translate-x-5" : ""
            }`}
          />
        </button>
      </section>

      {/* All times */}
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-600 text-ink-800">Today's prayers</h2>
          {city && <span className="text-xs text-ink-700/50 font-600">{city}</span>}
        </div>
        <ul className="space-y-2">
          {status === "ready" &&
            times.map((p, i) => {
              const isNext = next && next.activeIndex === i;
              return (
                <li
                  key={p.name}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 border ${
                    isNext
                      ? "bg-sage-500/10 border-sage-500/30"
                      : "bg-sand-50 border-sand-200"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{ICONS[p.name]}</span>
                    <span className={`font-800 ${isNext ? "text-sage-600" : "text-ink-800"}`}>
                      {p.name}
                    </span>
                    {isNext && (
                      <span className="text-xs font-700 text-sage-600 bg-sage-500/15 px-2 py-0.5 rounded-full">
                        next
                      </span>
                    )}
                  </span>
                  <span className={`font-700 tabular-nums ${isNext ? "text-sage-600" : "text-ink-700/70"}`}>
                    {to12h(p.time)}
                  </span>
                </li>
              );
            })}
        </ul>
        <p className="text-xs text-ink-700/45 mt-4 text-center">
          Times use the Umm al-Qura method. Confirm with your local masjid.
        </p>
      </section>

      <SurahPlayer />
    </div>
  );
}
