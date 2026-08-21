"use client";

// Adapter between the dashboard and the air conditioner.
//
// The browser cannot talk to a Gree unit directly: Gree speaks AES-encrypted
// JSON over UDP port 7000, and browser JavaScript has no UDP socket at all.
// Something on the LAN has to translate. The intended shape is:
//
//   dashboard  --HTTP-->  local helper (Home Assistant)  --UDP-->  AC
//
// IMPORTANT — do not put a Home Assistant long-lived token, or any other
// credential, in here. Everything in this file ships to the browser, and on
// Vercel that means publishing it to the open internet. An HA token typically
// grants control of the whole house. The helper should expose a small
// unauthenticated endpoint reachable only from the LAN.
//
// Note this only works when the dashboard is served from the LAN too. An
// HTTPS page on Vercel cannot call a plain-HTTP LAN address (mixed content,
// plus Chrome's Local Network Access gate).
//
// To connect: point this at the helper, e.g. "http://192.168.1.50:8080/ac".
export const AC_ENDPOINT = null;

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
