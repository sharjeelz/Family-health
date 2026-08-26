import { pollMessages } from "../../../../lib/telegram";
import { record, current, isLive } from "../../../../lib/sosSession";

export const dynamic = "force-dynamic";

// What Ammi and Abu have said back. The tablet polls this every few seconds
// while the popup is open, and stops the moment it closes — nothing runs in
// the background for the rest of the day.
export async function GET() {
  if (!isLive()) return Response.json({ live: false, replies: [] });

  try {
    record(await pollMessages());
  } catch (err) {
    // Telegram unreachable this second. Return what we already have rather
    // than blanking the screen a child is reading — but say so in the log,
    // because a silently swallowed error here is invisible and this path is
    // the whole feature.
    console.log("[sos/replies] poll failed:", err.message);
  }

  const { startedAt, replies } = current();
  return Response.json({ live: true, startedAt, replies });
}
