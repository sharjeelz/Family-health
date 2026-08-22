// Hisense / ConnectLife air conditioners. SERVER ONLY.
//
// Unlike the Gree, these have no local protocol — control goes out to
// ConnectLife's cloud and back. The awkward parts of that API (Gigya login,
// OAuth2, RSA-signed requests) live in scripts/connectlife_service.py, which
// keeps one authenticated session; we just speak HTTP to it.
//
// Set CONNECTLIFE_URL to enable. Off by default: without the Python service
// running, every call would simply time out.
const SERVICE = process.env.CONNECTLIFE_URL || "";

// The card name. Without this it falls back to the room name set in the
// ConnectLife app, which can collide with the Gree's label.
const LABEL = process.env.CONNECTLIFE_LABEL || "";

// A cloud round trip is ~1s, so give it room but never hang the dashboard.
const TIMEOUT = 8000;

// Codes come from the ConnectLife data dictionary for device type 009.
// Fan speeds are 0,5,6,7,8,9 — deliberately not 0-4.
const MODE_TO_NUM = { fan: 0, heat: 1, cool: 2, dry: 3, auto: 4 };
const NUM_TO_MODE = { 0: "fan", 1: "heat", 2: "cool", 3: "dry", 4: "auto" };
const FAN_TO_NUM = { auto: 0, low: 5, med: 7, high: 9 };
function numToFan(n) {
  if (n === 0) return "auto";
  if (n <= 6) return "low";
  if (n === 7) return "med";
  return "high";
}

export function isEnabled() {
  return SERVICE.length > 0;
}

async function call(path, init) {
  const res = await fetch(`${SERVICE}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || `service returned ${res.status}`);
  return body;
}

// The dashboard speaks power/temp/mode/fan; translate in both directions here
// so nothing above this file has to know about t_* property codes.
function toUnit(a) {
  const s = a.status || {};
  return {
    id: a.puid,
    kind: "hisense",
    label: LABEL || a.room || a.name || "Air conditioner",
    power: s.t_power === 1,
    temp: s.t_temp,
    mode: NUM_TO_MODE[s.t_work_mode] || "cool",
    fan: numToFan(s.t_fan_speed ?? 0),
    // This model reports a plausible indoor reading, unlike the Gree's sensor.
    roomTemp: typeof s.f_temp_in === "number" ? s.f_temp_in : null,
    online: a.online !== false,
    tempMin: 16,
    tempMax: 32,
  };
}

export async function listUnits() {
  if (!isEnabled()) return [];
  const { appliances } = await call("/appliances");
  // Device type 009 is the residential air conditioner; ignore fridges etc.
  return appliances.filter((a) => a.type === "009").map(toUnit);
}

export async function setUnit(puid, patch) {
  const properties = {};
  if (patch.power !== undefined) properties.t_power = patch.power ? 1 : 0;
  if (patch.temp !== undefined) properties.t_temp = Math.min(32, Math.max(16, Math.round(patch.temp)));
  if (patch.mode !== undefined && MODE_TO_NUM[patch.mode] !== undefined) properties.t_work_mode = MODE_TO_NUM[patch.mode];
  if (patch.fan !== undefined && FAN_TO_NUM[patch.fan] !== undefined) properties.t_fan_speed = FAN_TO_NUM[patch.fan];
  if (!Object.keys(properties).length) return null;

  const res = await call("/set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ puid, properties }),
  });
  return toUnit({ puid, status: res.status, type: "009" });
}
