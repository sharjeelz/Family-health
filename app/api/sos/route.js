import { sendMessage, sendPhoto, isConfigured } from "../../../lib/telegram";
import { snapshot, isEnabled } from "../../../lib/nvr";
import { begin, end } from "../../../lib/sosSession";

export const dynamic = "force-dynamic";

// The children's SOS button. The first outbound path in the app.
//
// Two rules govern everything here:
//
//   1. The alert goes first. Nothing slower — a camera snapshot, a reason —
//      is allowed to delay or block it.
//   2. Never report success we did not have. A confirmation screen shown over
//      a message that never left the house is the worst possible outcome, so
//      the response says plainly whether it was delivered.

const RATE_MS = 60_000;
let lastAlert = 0;

const REASONS = {
  door: "Someone is at the door",
  scared: "I'm scared",
  hurt: "I'm hurt",
};

function clockKSA() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  }).format(new Date());
}

// Two silent retries. A flaky moment on the wifi should not cost the alert,
// but three attempts at 8s each is already as long as anyone should be left
// staring at a spinner.
async function deliver(text) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await sendMessage(text);
      return;
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

// The phone numbers, fetched when the dashboard loads rather than at the
// moment of failure. If delivery fails because the laptop itself is
// unreachable, there is no response to carry them in — so they have to be in
// the browser already, before anything goes wrong.
export async function GET() {
  return Response.json({
    configured: isConfigured(),
    mom: process.env.MOM || null,
    dad: process.env.DAD || null,
  });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    /* a bare press sends no body */
  }
  const reason = REASONS[body.reason] ? body.reason : null;

  if (!isConfigured()) {
    return Response.json(
      { sent: false, error: "No Telegram bot configured on this machine." },
      { status: 503 },
    );
  }

  // A child leaning on the button should not flood the group — but a follow-up
  // reason is always allowed through, since the whole point of it is to add
  // detail to an alert that has already gone.
  const now = Date.now();
  if (!reason) {
    if (now - lastAlert < RATE_MS) return Response.json({ sent: true, repeat: true });
    lastAlert = now;
  }

  const text = reason
    ? `<b>${REASONS[reason]}</b> — from home, ${clockKSA()}`
    : `\u{1F6A8} <b>SOS from home</b> — ${clockKSA()}`;

  // Open the reply session before sending. Anything Telegram had queued from
  // before this moment is filtered out by timestamp in lib/sosSession.js,
  // rather than by draining the queue first — draining would cost a round trip
  // on the one path that must not be delayed.
  if (!reason) begin();

  try {
    await deliver(text);
  } catch (err) {
    if (!reason) {
      lastAlert = 0; // it never went; do not rate-limit the retry
      end(); // nothing was raised, so there is nothing to reply to
    }
    return Response.json({ sent: false, error: err.message }, { status: 502 });
  }

  // The snapshot is a bonus, sent after the alert is already delivered, and
  // only for "someone at the door" — the cameras all face outward, so that is
  // the one case they answer. It must never turn a delivered alert into a
  // failed one, hence the swallow.
  if (reason === "door" && isEnabled()) {
    try {
      const cam = Number(process.env.SOS_DOOR_CAMERA || 3);
      await sendPhoto(await snapshot(cam), "At the door just now");
    } catch {
      /* the alert is what mattered and it is already through */
    }
  }

  return Response.json({ sent: true });
}

// The child closed the popup. Stop the reply session so nothing keeps polling
// and a later message cannot surface out of context.
export async function DELETE() {
  end();
  return Response.json({ ok: true });
}
