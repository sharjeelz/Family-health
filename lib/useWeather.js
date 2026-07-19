"use client";

import { useState, useEffect } from "react";

// Maps Open-Meteo WMO weather codes to a label + icon key we animate.
export function describeWeather(code) {
  if (code === 0) return { label: "Clear sky", icon: "sun" };
  if (code === 1 || code === 2) return { label: "Partly cloudy", icon: "partly" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "rain" };
  if (code >= 95) return { label: "Thunderstorm", icon: "storm" };
  return { label: "—", icon: "cloud" };
}

export function useWeather() {
  const [state, setState] = useState({ status: "loading", temp: null, code: null, city: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat, lon, city) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        setState({
          status: "ready",
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          city: city || null,
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      }
    }

    async function reverseCity(lat, lon) {
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1`
        );
        const d = await r.json();
        return d?.results?.[0]?.name || null;
      } catch {
        return null;
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const city = await reverseCity(latitude, longitude);
          fetchWeather(latitude, longitude, city);
        },
        () => {
          // Permission denied or unavailable — fall back to a default (Riyadh).
          fetchWeather(24.7136, 46.6753, "Riyadh");
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(24.7136, 46.6753, "Riyadh");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
