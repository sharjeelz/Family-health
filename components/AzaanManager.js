"use client";

import { useState, useEffect, useRef } from "react";
import { usePrayerTimes, nextPrayer } from "../lib/usePrayerTimes";

// localStorage key: whether the azaan alert is enabled (default: on).
export const AZAAN_ENABLED_KEY = "azaan-enabled-v1";

const ARABIC_CALL = {
  Fajr: "حَيَّ عَلَى الصَّلَاة",
  Dhuhr: "حَيَّ عَلَى الصَّلَاة",
  Asr: "حَيَّ عَلَى الصَّلَاة",
  Maghrib: "حَيَّ عَلَى الصَّلَاة",
  Isha: "حَيَّ عَلَى الصَّلَاة",
};

const AUTO_DISMISS_MS = 4 * 60 * 1000; // close popup after 4 min if untouched

function pad(n) {
  return String(n).padStart(2, "0");
}
function dayKey(d, name) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${name}`;
}

// Plays the adhan. Tries /adhan.mp3 first; if it's missing or blocked, falls
// back to a short, gentle chime via the Web Audio API. Returns a stop().
function playAdhan() {
  let audio = null;
  let ctx = null;

  function chime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const notes = [523.25, 659.25, 783.99, 659.25]; // C5 E5 G5 E5
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
        osc.stop(start + 0.6);
      });
    } catch {
      /* ignore — audio is a best-effort nicety */
    }
  }

  try {
    audio = new Audio("/adhan.mp3");
    audio.play().catch(chime); // blocked or missing file → chime
  } catch {
    chime();
  }

  return function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (ctx) {
      try {
        ctx.close();
      } catch {}
    }
  };
}

export default function AzaanManager() {
  const { status, times } = usePrayerTimes();
  const [active, setActive] = useState(null); // { name } when popup is showing
  const firedRef = useRef(null); // dayKey of the last prayer we fired for
  const stopRef = useRef(null); // stop() for the currently playing audio
  const dismissRef = useRef(null); // auto-dismiss timer

  function close() {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    if (dismissRef.current) {
      clearTimeout(dismissRef.current);
      dismissRef.current = null;
    }
    setActive(null);
  }

  function trigger(name) {
    if (stopRef.current) stopRef.current();
    stopRef.current = playAdhan();
    setActive({ name });
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(close, AUTO_DISMISS_MS);
  }

  // Browsers block audio until the page has been interacted with. On the first
  // tap we "unlock" audio (play the adhan muted for an instant) so the real
  // azaan can play automatically at prayer time.
  // Demo: open the app with ?demoazaan=1 and tap once to hear a real azaan now.
  useEffect(() => {
    let demo = false;
    try {
      demo = new URLSearchParams(window.location.search).get("demoazaan") === "1";
    } catch {}

    function onFirstTouch() {
      try {
        const a = new Audio("/adhan.mp3");
        a.muted = true;
        a.play()
          .then(() => {
            a.pause();
            a.currentTime = 0;
          })
          .catch(() => {});
      } catch {}
      if (demo) {
        const name = times ? nextPrayer(times, new Date())?.nextName || "Dhuhr" : "Dhuhr";
        trigger(name);
      }
    }

    window.addEventListener("pointerdown", onFirstTouch, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstTouch);
  }, [times]);

  // Watch the clock and fire when a prayer minute arrives.
  useEffect(() => {
    if (status !== "ready" || !times) return;

    function checkNow() {
      let enabled = true;
      try {
        enabled = window.localStorage.getItem(AZAAN_ENABLED_KEY) !== "0";
      } catch {}
      if (!enabled) return;

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
    const t = setInterval(checkNow, 15000); // every 15s
    return () => clearInterval(t);
  }, [status, times]);

  // Clean up timers/audio on unmount.
  useEffect(() => () => close(), []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Time for ${active.name} prayer`}
    >
      <div className="pop-in relative w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-b from-ink-900 to-ink-800 text-sand-50 shadow-card">
        {/* ambient glow */}
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

          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-2xl text-sand-100/90 mt-4 leading-loose"
          >
            {ARABIC_CALL[active.name] || "حَيَّ عَلَى الصَّلَاة"}
          </p>
          <p className="text-sand-200/70 font-600 text-sm mt-1">Hayya ‘ala as-salah</p>

          <button
            onClick={close}
            className="mt-7 rounded-2xl bg-sage-500 text-white font-800 px-8 py-3 text-sm hover:bg-sage-600 active:scale-95 transition"
          >
            Stop &amp; dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Islamic scene: a mosque silhouette with dome, minarets, crescent moon and
// stars — drawn inline (no external image needed).
function MosqueScene() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120" aria-hidden="true">
      {/* crescent moon */}
      <g className="wx-pulse" style={{ transformOrigin: "118px 24px" }}>
        <circle cx="118" cy="24" r="12" fill="#F5B841" />
        <circle cx="123" cy="21" r="10" fill="#2C2419" />
      </g>
      {/* stars */}
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

      {/* minarets */}
      {[34, 116].map((x, i) => (
        <g key={i} fill="#5A8465">
          <rect x={x - 3} y="52" width="6" height="52" rx="2" />
          <path d={`M${x} 40 L${x + 5} 52 L${x - 5} 52 Z`} />
          <circle cx={x} cy="38" r="3" fill="#F5B841" />
        </g>
      ))}

      {/* main building */}
      <rect x="45" y="66" width="60" height="40" rx="2" fill="#456B4F" />
      {/* big dome */}
      <path d="M45 66 Q75 34 105 66 Z" fill="#5A8465" />
      <path d="M75 30 L75 40" stroke="#F5B841" strokeWidth="2" />
      <circle cx="75" cy="28" r="3.5" fill="#F5B841" />
      {/* arched door */}
      <path d="M67 106 L67 86 Q75 76 83 86 L83 106 Z" fill="#2C2419" />
      {/* ground line */}
      <rect x="24" y="104" width="102" height="4" rx="2" fill="#3D3428" />
    </svg>
  );
}
