"use client";

import { useState, useEffect } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export function usePrayerTimes() {
  const [state, setState] = useState({ status: "loading", times: null, city: null });

  useEffect(() => {
    let cancelled = false;

    async function load(lat, lon, city) {
      try {
        // method 4 = Umm al-Qura (used in Saudi Arabia)
        const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        const t = data.data.timings;
        const times = PRAYERS.map((name) => ({ name, time: t[name] }));
        setState({ status: "ready", times, city });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, null),
        () => load(24.7136, 46.6753, "Riyadh"),
        { timeout: 8000 }
      );
    } else {
      load(24.7136, 46.6753, "Riyadh");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Given [{name,time:"HH:MM"}], returns { nextName, countdown, activeIndex }
export function nextPrayer(times, now = new Date()) {
  if (!times) return null;
  const mins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < times.length; i++) {
    const [hh, mm] = times[i].time.split(":").map(Number);
    const t = hh * 60 + mm;
    if (t > mins) {
      const diff = t - mins;
      return {
        nextName: times[i].name,
        activeIndex: i,
        hours: Math.floor(diff / 60),
        minutes: diff % 60,
      };
    }
  }
  // past Isha — next is tomorrow's Fajr
  const [hh, mm] = times[0].time.split(":").map(Number);
  const diff = 24 * 60 - mins + (hh * 60 + mm);
  return {
    nextName: times[0].name,
    activeIndex: 0,
    hours: Math.floor(diff / 60),
    minutes: diff % 60,
  };
}
