// The state of the alert currently in progress: when it was raised, and what
// the parents have said back since.
//
// Deliberately in memory and deliberately singular. There is one fridge and
// one alert at a time, and an SOS that outlives a restart is worse than one
// that does not — a stale emergency reappearing on the tablet the next morning
// would be its own small alarm.
//
// Names come from SOS_NAMES in .env.local, mapping Telegram user ids to what
// the children actually call you (the same shape as NVR_CAMERAS):
//
//   SOS_NAMES=<dad-telegram-id>:Abu,<mum-telegram-id>:Ammi
//
// The ids are the numeric "from.id" Telegram reports for each person; the
// getUpdates response shows them once someone has posted in the group.
//
// Anyone unmapped falls back to their Telegram first name.

// On globalThis, not in module scope — the same reason lib/db.js, lib/gree.js
// and lib/recipyai.js do it. Next.js recompiles a route on its first request
// and re-instantiates the modules it imports, which silently wipes anything
// held in module scope. That is not academic here: the first poll for replies
// is itself the request that compiles the replies route, so a module-scoped
// session was destroyed by the very first attempt to read it, and no reply
// could ever arrive.
const g = globalThis;
g.__sosSession ||= { startedAt: 0, replies: [] };

function names() {
  const out = {};
  for (const pair of (process.env.SOS_NAMES || "").split(",")) {
    const [id, ...rest] = pair.split(":");
    const label = rest.join(":").trim();
    if (id?.trim() && label) out[id.trim()] = label;
  }
  return out;
}

export function begin() {
  g.__sosSession = { startedAt: Date.now(), replies: [] };
}

export function record(messages) {
  const session = g.__sosSession;
  if (!session.startedAt) return; // no alert running; ignore idle chatter
  const map = names();
  for (const m of messages) {
    // Chatter from before the button was pressed is not a reply to it. A
    // second of slack because Telegram timestamps are whole seconds.
    if (m.at && m.at < session.startedAt - 1000) continue;

    // A photograph carries a caption, not text, and arrives here as an empty
    // message. It is a memory, not an answer to a frightened child — showing
    // it as a blank bubble is worse than not showing it at all.
    if (!m.text || !m.text.trim()) continue;
    session.replies.push({
      name: map[m.userId] || m.name,
      text: m.text,
      at: m.at || Date.now(),
    });
  }
}

export function current() {
  return g.__sosSession;
}

export function isLive() {
  return Boolean(g.__sosSession.startedAt);
}

export function end() {
  g.__sosSession = { startedAt: 0, replies: [] };
}
