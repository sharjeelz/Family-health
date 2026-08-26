// A call the parents have started, waiting for the children to join.
//
// Started by sending /call to the family group, ended by /endcall or by either
// side hanging up. Nothing is live until a child actually taps Join — the
// camera in the house never opens on its own.
//
// On globalThis, like lib/sosSession.js: Next.js re-instantiates modules when
// it recompiles a route, which silently wipes module scope.

const g = globalThis;
g.__sosCall ||= { active: false, startedAt: 0, token: null, tokenAt: 0 };

// A hard ceiling on how long a call may run. Daily bills by participant-minute
// once the monthly allowance is gone, and a wall tablet is exactly the sort of
// thing a call gets left running on: two people connected around the clock
// would burn a month's allowance in under four days, unwatched. Normal calls
// are nowhere near this, so the cap only ever catches the forgotten ones.
const MAX_CALL_MS = 45 * 60 * 1000;

export function noteCall(messages) {
  for (const m of messages) {
    const text = (m.text || "").trim();
    if (/^\/call\b/i.test(text)) {
      g.__sosCall = { active: true, startedAt: m.at || Date.now(), token: null, tokenAt: 0 };
    } else if (/^\/endcall\b/i.test(text)) {
      clearCall();
    }
  }
}

export function currentCall() {
  const c = g.__sosCall;
  if (c.active && Date.now() - c.startedAt > MAX_CALL_MS) clearCall();
  return g.__sosCall;
}

export { MAX_CALL_MS };

export function setToken(token) {
  g.__sosCall.token = token;
  g.__sosCall.tokenAt = Date.now();
}

// Tokens last an hour. Replace one before it expires mid-call rather than
// after, so a long conversation is never cut off by our own housekeeping.
export function tokenStale() {
  const { token, tokenAt } = g.__sosCall;
  return !token || Date.now() - tokenAt > 50 * 60 * 1000;
}

export function clearCall() {
  g.__sosCall = { active: false, startedAt: 0, token: null, tokenAt: 0 };
}
