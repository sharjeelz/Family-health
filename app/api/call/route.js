import { drain } from "../../../lib/telegramPoller";
import { currentCall, setToken, tokenStale, clearCall } from "../../../lib/callSession";
import { mintToken, roomUrl, isConfigured } from "../../../lib/daily";
import { sendMessage } from "../../../lib/telegram";

export const dynamic = "force-dynamic";

const g = globalThis;

// Mint once even though several polls may arrive together, and post the
// parents' own link to the group as soon as the room is ready.
async function prepare() {
  if (g.__callPrep) return g.__callPrep;
  g.__callPrep = (async () => {
    try {
      const tablet = await mintToken({ name: "Home", owner: false });
      setToken(tablet);
      const owner = await mintToken({ name: "Abu", owner: true });
      // Daily prefers the token passed in the join call, which is what the
      // tablet does. A phone needs something tappable, so this one rides in
      // the URL — acceptable only because it expires within the hour and goes
      // nowhere but the private family group.
      await sendMessage(`Call ready — join here:\n${roomUrl()}?t=${owner}`);
    } finally {
      g.__callPrep = null;
    }
  })();
  return g.__callPrep;
}

// Polled by the tablet. Also the app's only Telegram reader alongside the SOS
// replies route — both go through drain() so they cannot steal each other's
// messages.
export async function GET() {
  if (!isConfigured()) return Response.json({ active: false, configured: false });

  try {
    await drain();
  } catch {
    /* a missed poll is not worth an error on screen */
  }

  const call = currentCall();
  if (call.active && tokenStale()) {
    try {
      await prepare();
    } catch (err) {
      console.log("[call] could not prepare the room:", err.message);
      return Response.json({ active: true, error: "Could not start the call" });
    }
  }

  const now = currentCall();
  return Response.json({
    active: now.active,
    startedAt: now.startedAt,
    url: now.active ? roomUrl() : null,
    token: now.active ? now.token : null,
  });
}

// The children hung up, or dismissed the ringing.
export async function DELETE() {
  clearCall();
  return Response.json({ ok: true });
}
