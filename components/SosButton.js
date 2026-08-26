"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { startSiren, stopSiren } from "../lib/audio";

const HOLD_MS = 1000;

// Reasons are optional and sent *after* the alert is already through, so they
// cost nothing. Deliberately few and large — a frightened child should not be
// reading a menu.
const REASONS = [
  { id: "door", label: "Someone at the door" },
  { id: "scared", label: "I'm scared" },
  { id: "hurt", label: "I'm hurt" },
];

// The SOS button: held for a second, it messages both parents' phones.
//
// Hold rather than tap because this is a permanently visible red button on a
// fridge, in a house with a nursery-age child. A tap would be pressed for fun,
// and a press starts a siren. Holding is still one gesture and needs no
// reading, but is essentially impossible to trigger by brushing past.
export default function SosButton() {
  const [held, setHeld] = useState(0); // 0..1, fills the ring
  const [state, setState] = useState(null); // null | "sending" | "sent" | "failed"
  const [sirenOn, setSirenOn] = useState(false);
  const [reasonSent, setReasonSent] = useState(null);
  const [contacts, setContacts] = useState({ mom: null, dad: null });
  const [replies, setReplies] = useState([]);
  const [waited, setWaited] = useState(0); // seconds since the alert went
  const raf = useRef(null);
  const start = useRef(0);

  useEffect(() => () => stopSiren(), []); // never leave it wailing on unmount

  // Pulled at load, not at the moment of failure — see the note on GET in
  // app/api/sos/route.js.
  useEffect(() => {
    fetch("/api/sos")
      .then((r) => r.json())
      .then((d) => setContacts({ mom: d.mom, dad: d.dad }))
      .catch(() => {});
  }, []);

  // Poll for what Ammi and Abu say back, but only while the popup is open.
  // Nothing runs in the background for the rest of the day.
  useEffect(() => {
    if (state !== "sent") return;
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/sos/replies");
        const d = await r.json();
        if (alive && d.replies) setReplies(d.replies);
      } catch {
        /* a missed poll is not worth showing an error for */
      }
    };
    tick();
    const iv = setInterval(tick, 3000);
    const clock = setInterval(() => setWaited((w) => w + 1), 1000);
    return () => {
      alive = false;
      clearInterval(iv);
      clearInterval(clock);
    };
  }, [state]);

  const send = useCallback(async (reason) => {
    if (!reason) setState("sending");
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reason ? { reason } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (reason) {
        if (data.sent) setReasonSent(reason);
        return;
      }
      setState(data.sent ? "sent" : "failed");
    } catch {
      // The fetch itself failed — the laptop is asleep, or the tablet is off
      // the wifi. Either way it did not arrive, and we say so.
      if (!reason) setState("failed");
    }
  }, []);

  // The siren runs whether or not the message got through. When the network
  // cannot reach a parent, noise reaching a neighbour is the fallback.
  function fire() {
    startSiren();
    setSirenOn(true);
    send(null);
  }

  function beginHold() {
    if (state) return;
    start.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
      setHeld(p);
      if (p >= 1) {
        setHeld(0);
        fire();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function endHold() {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setHeld(0);
  }

  function hush() {
    stopSiren();
    setSirenOn(false);
  }

  function dismiss() {
    hush();
    setState(null);
    setReasonSent(null);
    setReplies([]);
    setWaited(0);
    fetch("/api/sos", { method: "DELETE" }).catch(() => {});
  }

  // Stay open until they have actually heard something back — but never trap a
  // child in a screen they cannot dismiss. If no reply comes within two
  // minutes (phone on silent, no signal), Close returns on its own. A failed
  // send is always closable: there is nothing to wait for.
  const canClose = state !== "sent" || replies.length > 0 || waited >= 120;

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <>
      <button
        onPointerDown={beginHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Hold for one second to call Mum and Dad"
        className="fixed left-4 bottom-24 wall:bottom-4 z-30 w-16 h-16 rounded-full bg-red-600 text-white shadow-card flex items-center justify-center hover:bg-red-700 active:scale-95 transition select-none touch-none"
      >
        <span className="font-800 text-lg tracking-wide">SOS</span>
        {/* Ring fills as they hold, so the wait is visible, not guessed */}
        {held > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle
              cx="32" cy="32" r={R} fill="none" stroke="white" strokeWidth="4"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - held)}
            />
          </svg>
        )}
      </button>

      {state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 backdrop-blur-sm p-6">
          <div className="pop-in w-full max-w-md bg-sand-50 rounded-3xl shadow-card p-6 text-center">
            {state === "sending" && (
              <p className="font-display text-2xl text-ink-800 py-6">Calling Ammi and Abu…</p>
            )}

            {state === "sent" && (
              <>
                <p className="font-display text-3xl text-sage-600 font-600">
                  Ammi and Abu have been told
                </p>
                <p className="text-ink-700/60 font-600 mt-2">They are coming. You are okay.</p>

                {!reasonSent ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-ink-700/45 font-700 mt-6 mb-2">
                      Want to tell them more?
                    </p>
                    <div className="space-y-2">
                      {REASONS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => send(r.id)}
                          className="w-full rounded-2xl bg-white border border-sand-200 px-4 py-3 font-800 text-ink-800 hover:bg-sand-100 active:scale-[0.98] transition"
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-6 font-700 text-sage-600">Told them. Nothing else to do.</p>
                )}

                {/* What they say back. One-way on purpose — a frightened child
                    should not be made to type. */}
                {replies.length > 0 && (
                  <div className="mt-6 text-left space-y-2 max-h-56 overflow-y-auto">
                    {replies.map((r, i) => (
                      <div key={i} className="rounded-2xl bg-sage-500/10 border border-sage-500/25 px-4 py-3">
                        <p className="text-xs font-800 text-sage-600 uppercase tracking-wider">
                          {r.name}
                        </p>
                        <p className="text-ink-800 font-600 mt-0.5 break-words">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {state === "failed" && (
              <>
                <p className="font-display text-3xl text-red-700 font-600">
                  Could not reach them
                </p>
                {/* No comforting lie here. If it did not send, the child needs
                    to dial, and needs the numbers big enough to read in a hurry. */}
                <p className="text-ink-700/70 font-600 mt-2">
                  The message did not go. Please phone them.
                </p>
                <div className="mt-5 space-y-3">
                  {[["MUM", contacts.mom], ["DAD", contacts.dad]].map(([who, num]) =>
                    num ? (
                      <a
                        key={who}
                        href={`tel:${num}`}
                        className="block rounded-2xl bg-white border-2 border-red-600/30 px-4 py-4"
                      >
                        <span className="block text-xs uppercase tracking-wider text-ink-700/50 font-700">
                          {who}
                        </span>
                        <span className="block font-800 text-2xl text-ink-800 tabular-nums mt-0.5">
                          {num}
                        </span>
                      </a>
                    ) : null,
                  )}
                </div>
              </>
            )}

            <div className="mt-6 flex gap-2">
              {sirenOn && (
                <button
                  onClick={hush}
                  className="flex-1 rounded-2xl bg-ink-800 text-sand-50 px-4 py-3 font-800 active:scale-[0.98] transition"
                >
                  Stop siren
                </button>
              )}
              {canClose ? (
                <button
                  onClick={dismiss}
                  className="flex-1 rounded-2xl bg-sand-200 text-ink-800 px-4 py-3 font-800 active:scale-[0.98] transition"
                >
                  Close
                </button>
              ) : (
                <p className="flex-1 self-center text-sm font-700 text-ink-700/50">
                  Waiting for Ammi and Abu…
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
