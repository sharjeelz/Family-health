"use client";

// Adapter between the dashboard and the air conditioner.
//
// The browser cannot talk to a Gree unit directly: Gree speaks AES-encrypted
// JSON over UDP port 7000, and browser JavaScript has no UDP socket at all.
// Since the dashboard is served from the LAN by our own Node process, that
// process does the talking:
//
//   browser  --HTTP-->  /api/ac (Node, lib/gree.js)  --UDP-->  AC
//
// So this file only ever speaks to our own origin. The unit's address lives in
// AC_HOST in .env.local and stays server-side; nothing about the AC ships to
// the browser.
export const AC_ENDPOINT = "/api/ac";

export const MODES = ["cool", "dry", "fan", "heat", "auto"];
export const FAN_SPEEDS = ["auto", "low", "med", "high"];
export const TEMP_MIN = 16;
export const TEMP_MAX = 30;

export const DEFAULT_STATE = {
  power: false,
  temp: 24,
  mode: "cool",
  fan: "auto",
};

export function isConnected() {
  return typeof AC_ENDPOINT === "string" && AC_ENDPOINT.length > 0;
}

export async function fetchState() {
  if (!isConnected()) return null;
  const res = await fetch(AC_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error(`AC helper returned ${res.status}`);
  return res.json();
}

// The helper is expected to accept a partial state and apply it.
export async function pushState(patch) {
  if (!isConnected()) return null;
  const res = await fetch(AC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`AC helper returned ${res.status}`);
  return res.json();
}

export function clampTemp(t) {
  return Math.min(TEMP_MAX, Math.max(TEMP_MIN, t));
}
