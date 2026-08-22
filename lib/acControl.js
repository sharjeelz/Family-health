"use client";

// Adapter between the dashboard and the air conditioners.
//
// The browser talks only to our own origin. Everything make-specific happens
// server-side: the Gree over UDP on the LAN (lib/gree.js), the Hisense through
// the ConnectLife cloud (lib/hisense.js). Neither unit's address nor any
// credential reaches the browser.
export const AC_ENDPOINT = "/api/ac";

export const MODES = ["cool", "dry", "fan", "heat", "auto"];
export const FAN_SPEEDS = ["auto", "low", "med", "high"];

// Fallbacks only — each unit reports its own range, because the two makes
// differ (Gree tops out at 30°C, the Hisense at 32°C).
export const TEMP_MIN = 16;
export const TEMP_MAX = 30;

export async function fetchUnits() {
  const res = await fetch(AC_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error(`AC service returned ${res.status}`);
  const { units } = await res.json();
  return units || [];
}

// Applies a partial change to one unit and returns that unit's new state.
export async function pushUnit(id, patch) {
  const res = await fetch(AC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, patch }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `AC service returned ${res.status}`);
  return body.unit;
}

export function clampTemp(t, min = TEMP_MIN, max = TEMP_MAX) {
  return Math.min(max, Math.max(min, t));
}
