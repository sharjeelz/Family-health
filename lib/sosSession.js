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

let session = { startedAt: 0, replies: [] };

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
  session = { startedAt: Date.now(), replies: [] };
}

export function record(messages) {
  if (!session.startedAt) return; // no alert running; ignore idle chatter
  const map = names();
  for (const m of messages) {
    // Chatter from before the button was pressed is not a reply to it. A
    // second of slack because Telegram timestamps are whole seconds.
    if (m.at && m.at < session.startedAt - 1000) continue;
    session.replies.push({
      name: map[m.userId] || m.name,
      text: m.text,
      at: m.at || Date.now(),
    });
  }
}

export function current() {
  return session;
}

export function isLive() {
  return Boolean(session.startedAt);
}

export function end() {
  session = { startedAt: 0, replies: [] };
}
