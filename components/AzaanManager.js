"use client";

import { useState, useEffect, useRef } from "react";
import { usePrayerTimes, nextPrayer } from "../lib/usePrayerTimes";
import { armAudio } from "../lib/audio";

// localStorage key: whether the azaan alert is enabled (default: on).
export const AZAAN_ENABLED_KEY = "azaan-enabled-v1";

const ARABIC_CALL = {
  Fajr: "حَيَّ عَلَى الصَّلَاة، الصَّلَاةُ خَيْرٌ مِنَ النَّوْم",
  Dhuhr: "حَيَّ عَلَى الصَّلَاة",
  Asr: "حَيَّ عَلَى الصَّلَاة",
  Maghrib: "حَيَّ عَلَى الصَّلَاة",
  Isha: "حَيَّ عَلَى الصَّلَاة",
};

const AUTO_DISMISS_MS = 5 * 60 * 1000; // close popup after 5 min if untouched

function pad(n) {
  return String(n).padStart(2, "0");
}
function dayKey(d, name) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${name}`;
}

export default function AzaanManager() {
  const { status, times } = usePrayerTimes();
  const [active, setActive] = useState(null); // { name, blocked } while popup is up
  const [audioReady, setAudioReady] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const firedRef = useRef(null); // dayKey of the last prayer we fired for
  const dismissRef = useRef(null);
  const audioElRef = useRef(null); // one reusable <audio> element
  const ctxRef = useRef(null); // one reusable AudioContext for the chime fallback

  // --- audio helpers -------------------------------------------------------
  function getAudioEl() {
    if (!audioElRef.current) {
      const a = new Audio("/adhan.mp3");
      a.preload = "auto";
      audioElRef.current = a;
    }
    return audioElRef.current;
  }

  // Must run inside a user gesture the first time (browser autoplay policy).
  function unlockAudio() {
    try {
      const a = getAudioEl();
      a.muted = true;
      const p = a.play();
      if (p && p.then) {
        p.then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        }).catch(() => {
          a.muted = false;
        });
      } else {
        a.muted = false;
      }
    } catch {}
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        if (!ctxRef.current) ctxRef.current = new AC();
        if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      }
    } catch {}
    armAudio(); // also arm the shared engine used by the water chime
    setAudioReady(true);
  }

  function chime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctxRef.current) ctxRef.current = new AC();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const notes = [523.25, 659.25, 783.99, 659.25];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        const start = ctx.currentTime + i * 0.6;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.62);
      });
    } catch {}
  }

  function stopAudio() {
    try {
      const a = audioElRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    } catch {}
  }

  // Attempt to play the adhan; fall back to the chime and flag if blocked.
  function playAdhan() {
    try {
      const a = getAudioEl();
      a.muted = false;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.then) {
        p.then(() => {
          setActive((s) => (s ? { ...s, blocked: false } : s));
        }).catch(() => {
          chime();
          setActive((s) => (s ? { ...s, blocked: true } : s));
        });
      }
    } catch {
      chime();
      setActive((s) => (s ? { ...s, blocked: true } : s));
    }
  }

  // --- popup lifecycle -----------------------------------------------------
  function close() {
    stopAudio();
    if (dismissRef.current) {
      clearTimeout(dismissRef.current);
      dismissRef.current = null;
    }
    setActive(null);
  }

  function trigger(name) {
    stopAudio();
    setActive({ name, blocked: false });
    playAdhan();
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(close, AUTO_DISMISS_MS);
  }

  // Play button inside the popup — a real gesture, so this always makes sound.
  function playNow() {
    unlockAudio();
    stopAudio();
    const a = getAudioEl();
    a.muted = false;
    a.currentTime = 0;
    const p = a.play();
    if (p && p.then) {
      p.then(() => setActive((s) => (s ? { ...s, blocked: false } : s))).catch(() => chime());
    }
  }

  // --- effects -------------------------------------------------------------
  // Reflect the on/off setting (for the "enable sound" prompt).
  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem(AZAAN_ENABLED_KEY) !== "0");
    } catch {}
  }, [active]);

  // Unlock audio on the first user interaction of the session.
  useEffect(() => {
    let demo = false;
    try {
      demo = new URLSearchParams(window.location.search).get("demoazaan") === "1";
    } catch {}

    function onFirst() {
      unlockAudio();
      if (demo) {
        const name = times ? nextPrayer(times, new Date())?.nextName || "Dhuhr" : "Dhuhr";
        trigger(name);
      }
    }

    const evts = ["pointerdown", "touchstart", "keydown", "click"];
    evts.forEach((e) => window.addEventListener(e, onFirst, { once: true, passive: true }));
    return () => evts.forEach((e) => window.removeEventListener(e, onFirst));
  }, [times]);

  // Watch the clock and fire when a prayer minute arrives.
  useEffect(() => {
    if (status !== "ready" || !times) return;

    function checkNow() {
      let on = true;
      try {
        on = window.localStorage.getItem(AZAAN_ENABLED_KEY) !== "0";
      } catch {}
      if (!on) return;

      const now = new Date();
      const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      for (const p of times) {
        if (p.time.slice(0, 5) === hhmm) {
          const key = dayKey(now, p.name);
          if (firedRef.current !== key) {
            firedRef.current = key;
            trigger(p.name);
          }
          break;
        }
      }
    }

    checkNow();
    const t = setInterval(checkNow, 15000);
    return () => clearInterval(t);
  }, [status, times]);

  useEffect(() => () => close(), []);

  // "Enable sound" nudge — so a kiosk that's never been tapped can arm audio.
  const showEnable = enabled && !audioReady && !active;

  return (
    <>
      {showEnable && (
        <button
          onClick={unlockAudio}
          className="fixed bottom-24 left-4 z-30 flex items-center gap-2 rounded-full bg-ink-800 text-sand-50 shadow-card pl-3 pr-4 py-2.5 active:scale-95 transition"
        >
          <span className="text-base" aria-hidden="true">🔔</span>
          <span className="text-xs font-800 leading-tight text-left">
            Tap to enable
            <br />
            Azaan sound
          </span>
        </button>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Time for ${active.name} prayer`}
        >
          <div className="pop-in relative w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-b from-ink-900 to-ink-800 text-sand-50 shadow-card">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(120% 70% at 50% 0%, rgba(90,132,101,0.35), transparent 60%)",
              }}
            />

            <div className="relative flex flex-col items-center text-center px-8 pt-9 pb-8">
              <MosqueScene />

              <p className="text-sage-400 font-800 text-xs uppercase tracking-[0.22em] mt-6">
                It's time for
              </p>
              <p className="font-display text-5xl font-700 mt-1">{active.name}</p>

              <p dir="rtl" lang="ar" className="font-arabic text-2xl text-sand-100/90 mt-4 leading-loose">
                {ARABIC_CALL[active.name] || "حَيَّ عَلَى الصَّلَاة"}
              </p>
              <p className="text-sand-200/70 font-600 text-sm mt-1">Hayya ‘ala as-salah</p>

              {active.blocked && (
                <p className="text-clay-400 font-700 text-xs mt-4">
                  Sound was blocked by the browser — tap Play.
                </p>
              )}

              <div className="flex items-center gap-2 mt-7">
                <button
                  onClick={playNow}
                  className={`rounded-2xl font-800 px-6 py-3 text-sm active:scale-95 transition ${
                    active.blocked
                      ? "bg-clay-500 text-white hover:bg-clay-600"
                      : "bg-white/10 text-sand-50 hover:bg-white/20"
                  }`}
                >
                  🔊 Play
                </button>
                <button
                  onClick={close}
                  className="rounded-2xl bg-sage-500 text-white font-800 px-6 py-3 text-sm hover:bg-sage-600 active:scale-95 transition"
                >
                  Stop &amp; dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Islamic scene: a mosque silhouette with dome, minarets, crescent moon and
// stars — drawn inline (no external image needed).
function MosqueScene() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120" aria-hidden="true">
      <g className="wx-pulse" style={{ transformOrigin: "118px 24px" }}>
        <circle cx="118" cy="24" r="12" fill="#F5B841" />
        <circle cx="123" cy="21" r="10" fill="#2C2419" />
      </g>
      {[
        [28, 20],
        [46, 32],
        [92, 16],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 3} L${x + 1} ${y - 1} L${x + 3} ${y} L${x + 1} ${y + 1} L${x} ${y + 3} L${x - 1} ${y + 1} L${x - 3} ${y} L${x - 1} ${y - 1} Z`}
          fill="#F0EADD"
          className="wx-flash"
          style={{ animationDelay: `${i * 0.6}s` }}
        />
      ))}
      {[34, 116].map((x, i) => (
        <g key={i} fill="#5A8465">
          <rect x={x - 3} y="52" width="6" height="52" rx="2" />
          <path d={`M${x} 40 L${x + 5} 52 L${x - 5} 52 Z`} />
          <circle cx={x} cy="38" r="3" fill="#F5B841" />
        </g>
      ))}
      <rect x="45" y="66" width="60" height="40" rx="2" fill="#456B4F" />
      <path d="M45 66 Q75 34 105 66 Z" fill="#5A8465" />
      <path d="M75 30 L75 40" stroke="#F5B841" strokeWidth="2" />
      <circle cx="75" cy="28" r="3.5" fill="#F5B841" />
      <path d="M67 106 L67 86 Q75 76 83 86 L83 106 Z" fill="#2C2419" />
      <rect x="24" y="104" width="102" height="4" rx="2" fill="#3D3428" />
    </svg>
  );
}
