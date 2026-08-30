import { sendVoice } from "../../../../lib/telegram";
import { isLive } from "../../../../lib/sosSession";

export const dynamic = "force-dynamic";

// The children speaking, when none of the three buttons says what they mean.
//
// Only while an alert is running: this posts audio from the house into the
// family group, and it should not be reachable the rest of the day.
const MAX_BYTES = 5 * 1024 * 1024; // ~2 minutes of Opus, far beyond the cap on the tablet

export async function POST(req) {
  if (!isLive()) {
    return Response.json({ sent: false, error: "No alert is running." }, { status: 409 });
  }

  const type = req.headers.get("content-type") || "";
  if (!/^audio\//.test(type)) {
    return Response.json({ sent: false, error: "Expected audio." }, { status: 415 });
  }

  const bytes = Buffer.from(await req.arrayBuffer());
  if (!bytes.length) return Response.json({ sent: false, error: "Empty recording." }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return Response.json({ sent: false, error: "Recording too long." }, { status: 413 });
  }

  try {
    await sendVoice(bytes, type, "From home");
    return Response.json({ sent: true });
  } catch (err) {
    console.log("[sos/voice] could not send:", err.message);
    return Response.json({ sent: false, error: err.message }, { status: 502 });
  }
}
