// Video calls, so the children can see and talk to us while we are out.
//
// The room itself is fixed and *private*, which in Daily means nobody can get
// in without a meeting token. Tokens are minted here, server-side, and they
// expire — so the room is permanent but the ability to enter it is not. That
// is what makes it safe to have a standing room pointing into the house: a
// link that leaks is worthless within the hour.
//
// Config in .env.local:
//
//   DAILY_API_KEY=   from the dashboard's Developers page — a password
//   DAILY_DOMAIN=    the subdomain only, the part before .daily.co
//   DAILY_ROOM=      the room name, the last part of its URL

const API = "https://api.daily.co/v1";
const TIMEOUT = 8000;

// An hour is longer than any call they will actually have, and short enough
// that a leaked link is dead by the time anyone finds it.
const TOKEN_TTL_S = 60 * 60;

// Daily's included allowance per month, in participant-minutes: one person in
// a call for ten minutes is ten, two people is twenty.
export const FREE_ALLOWANCE = 10000;

function config() {
  const key = process.env.DAILY_API_KEY;
  const domain = process.env.DAILY_DOMAIN;
  const room = process.env.DAILY_ROOM;
  if (!key || !domain || !room) return null;
  return { key, domain, room };
}

export function isConfigured() {
  return Boolean(config());
}

export function roomUrl() {
  const c = config();
  return c ? `https://${c.domain}.daily.co/${c.room}` : null;
}

// `owner` gets the parents admin rights in the call; the tablet joins as a
// plain participant.
export async function mintToken({ name, owner = false }) {
  const c = config();
  if (!c) throw new Error("Daily is not configured");

  let res;
  try {
    res = await fetch(`${API}/meeting-tokens`, {
      method: "POST",
      headers: { Authorization: `Bearer ${c.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          room_name: c.room,
          user_name: name,
          is_owner: owner,
          exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_S,
        },
      }),
      cache: "no-store", // Next caches fetch by default; a token must never be reused
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch {
    throw new Error("Could not reach Daily");
  }

  const data = await res.json().catch(() => null);
  // Never surface the raw body: it is an authenticated response and the key is
  // in the request that produced it.
  if (!res.ok || !data?.token) throw new Error(`Daily refused the token (${res.status})`);
  return data.token;
}

// What the calls have cost so far. Read-only, and reported to the family group
// on /meeting — the question "is this billing me?" tends to come up when you
// are out, not when you are stood at the fridge.
export async function usage() {
  const c = config();
  if (!c) throw new Error("Daily is not configured");

  let res;
  try {
    res = await fetch(`${API}/meetings?limit=100`, {
      headers: { Authorization: `Bearer ${c.key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch {
    throw new Error("Could not reach Daily");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Daily refused the request (${res.status})`);

  const now = new Date();
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000;

  let month = 0;
  let sessions = 0;
  for (const s of data?.data || []) {
    const minutes = (s.participants || []).reduce(
      (t, p) => t + Math.max(0, p.duration || 0) / 60,
      0,
    );
    if (s.start_time >= monthStart) {
      month += minutes;
      sessions += 1;
    }
  }
  return { month, sessions, allowance: FREE_ALLOWANCE };
}
