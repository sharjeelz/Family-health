"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { startRing, stopRing } from "../lib/audio";

const POLL_MS = 4000;

// Matches the server's ceiling. Belt and braces on purpose: if the tablet
// loses touch with the server it must still hang itself up rather than sit
// there connected and billing.
const MAX_CALL_MS = 45 * 60 * 1000;

// The children seeing and talking to us while we are out.
//
// We start a call by sending /call to the family group; the dashboard notices,
// rings gently, and puts a Join button in front of whoever is home. Nothing
// connects on its own — the camera in the house opens only when a child taps
// Join, and either side can hang up.
export default function CallScreen() {
  const [call, setCall] = useState(null); // { url, token, startedAt }
  const [joined, setJoined] = useState(false);
  const [dismissed, setDismissed] = useState(0); // startedAt of a call they waved away
  const [error, setError] = useState(null);
  const holder = useRef(null);
  const frame = useRef(null);
  const leaving = useRef(false);

  // Poll for a call being started. Cheap, and the only way in from outside the
  // house — the dashboard is not reachable from the internet.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/call");
        const d = await r.json();
        if (!alive) return;
        setCall(d.active && d.url && d.token ? d : null);
      } catch {
        /* a missed poll is not worth showing */
      }
    };
    tick();
    const iv = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  const ringing = Boolean(call) && !joined && dismissed !== call?.startedAt;

  useEffect(() => {
    if (ringing) startRing();
    else stopRing();
    return () => stopRing();
  }, [ringing]);

  // Hang up regardless once the ceiling is reached — see lib/callSession.js.
  useEffect(() => {
    if (!joined) return;
    const t = setTimeout(() => leave(true), MAX_CALL_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  // If the parents end the call from their side, take the tablet out of it.
  useEffect(() => {
    if (!call && joined) leave(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const join = useCallback(async () => {
    if (!call || frame.current) return;
    setError(null);
    try {
      const { default: DailyIframe } = await import("@daily-co/daily-js");
      const f = DailyIframe.createFrame(holder.current, {
        showLeaveButton: false, // we provide our own, large and always visible
        iframeStyle: { width: "100%", height: "100%", border: "0" },
      });
      frame.current = f;

      f.on("left-meeting", () => {
        // A drop is not the same as hanging up. If we did not ask to leave,
        // get back in — this is the whole "nudge it to join again" behaviour,
        // and it is only possible because the call runs inside the app.
        if (leaving.current) return;
        frame.current = null;
        setJoined(false);
      });
      f.on("error", (e) => setError(e?.errorMsg || "The call dropped"));

      await f.join({ url: call.url, token: call.token });
      setJoined(true);
    } catch (e) {
      setError(e?.message || "Could not join the call");
      frame.current = null;
    }
  }, [call]);

  async function leave(tellServer = true) {
    leaving.current = true;
    stopRing();
    try {
      await frame.current?.destroy();
    } catch {
      /* already gone */
    }
    frame.current = null;
    setJoined(false);
    if (tellServer) {
      setCall(null);
      fetch("/api/call", { method: "DELETE" }).catch(() => {});
    }
    leaving.current = false;
  }

  function dismiss() {
    stopRing();
    setDismissed(call?.startedAt || 0);
  }

  if (!call && !joined) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-ink-900">
      {/* The call itself lives here; kept mounted so a rejoin is instant. */}
      <div ref={holder} className={`w-full h-full ${joined ? "" : "hidden"}`} />

      {joined && (
        <button
          onClick={() => leave(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-800 text-lg shadow-card active:scale-95 transition"
        >
          Hang up
        </button>
      )}

      {ringing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-sand-50">
          <div className="w-24 h-24 rounded-full bg-sage-500/15 flex items-center justify-center mb-6 animate-pulse">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.6" className="text-sage-600" aria-hidden="true">
              <path d="M23 7l-7 5 7 5V7z" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          </div>
          <p className="font-display text-4xl text-ink-800 font-600">Ammi and Abu are calling</p>
          <p className="text-ink-700/55 font-600 mt-2">Tap to see them and talk</p>

          {error && <p className="mt-4 font-700 text-red-700">{error}</p>}

          <button
            onClick={join}
            className="mt-8 rounded-full bg-sage-500 hover:bg-sage-600 text-white px-12 py-5 font-800 text-2xl shadow-card active:scale-95 transition"
          >
            Join
          </button>
          <button
            onClick={dismiss}
            className="mt-4 text-ink-700/50 font-700 underline underline-offset-4"
          >
            Not now
          </button>
        </div>
      )}

      {/* Dropped mid-call: back to the ringing screen rather than a dead end. */}
      {!joined && !ringing && call && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sand-50 p-8 text-center">
          <p className="font-display text-3xl text-ink-800 font-600">The call stopped</p>
          <button
            onClick={join}
            className="mt-6 rounded-full bg-sage-500 hover:bg-sage-600 text-white px-10 py-4 font-800 text-xl shadow-card active:scale-95 transition"
          >
            Join again
          </button>
          <button onClick={() => leave(true)} className="mt-4 text-ink-700/50 font-700 underline underline-offset-4">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
