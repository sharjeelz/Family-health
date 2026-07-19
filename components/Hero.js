"use client";

import { useState, useEffect } from "react";
import { useWeather, describeWeather } from "../lib/useWeather";
import WeatherIcon from "./WeatherIcon";

// The kitchen belongs to Mom :) — greet her by name.
const HOST_NAME = "Hifza";

function greeting(h) {
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export default function Hero() {
  const [now, setNow] = useState(null);
  const weather = useWeather();

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return <div className="h-40" aria-hidden="true" />;
  }

  const h = now.getHours();
  const hour12 = ((h + 11) % 12) + 1;
  const mins = String(now.getMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const wx = weather.status === "ready" ? describeWeather(weather.code) : null;

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem] bg-ink-900 text-sand-50 px-6 pt-8 pb-7 shadow-card">
      {/* ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(197,107,60,0.35), transparent 55%), radial-gradient(120% 90% at 0% 100%, rgba(90,132,101,0.30), transparent 55%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-3xl sm:text-4xl font-600 leading-tight">
            {greeting(h)}, {HOST_NAME}
          </p>
          <p className="text-sand-200/80 font-600 text-sm mt-1">{dateLabel}</p>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="font-display text-5xl sm:text-6xl font-700 tabular-nums tracking-tight">
              {hour12}:{mins}
            </span>
            <span className="text-sand-200/70 font-700 text-lg">{ampm}</span>
          </div>
        </div>

        {/* Weather */}
        <div className="shrink-0 text-right">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-3xl px-4 py-3 min-w-[104px]">
            {weather.status === "loading" && (
              <span className="text-sand-200/70 text-sm py-4">Loading…</span>
            )}
            {weather.status === "error" && (
              <span className="text-sand-200/70 text-xs py-4">Weather<br />unavailable</span>
            )}
            {weather.status === "ready" && wx && (
              <>
                <WeatherIcon icon={wx.icon} size={52} />
                <span className="font-display text-3xl font-700 leading-none mt-1">
                  {weather.temp}°
                </span>
                <span className="text-sand-200/80 text-xs font-600 mt-0.5">{wx.label}</span>
                {weather.city && (
                  <span className="text-sand-200/60 text-xs font-600">{weather.city}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
