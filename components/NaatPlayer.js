"use client";

import { NAATS } from "../lib/naats";
import { useQuranPlayer } from "./QuranPlayer";

function fmt(t) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Naats, sharing the app-level player with the surah list — so playback
// survives switching tabs, and starting a naat stops any recitation rather
// than playing over the top of it.
export default function NaatPlayer() {
  const { activeId, playing, cur, dur, missing, toggle, seek } = useQuranPlayer();

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-display text-2xl font-600 text-ink-800">Naats</h2>
      </div>
      <p className="text-sm text-ink-700/55 mb-4">Tap one to play — keeps playing across tabs.</p>

      <ul className="space-y-2">
        {NAATS.map((n) => {
          const isActive = activeId === n.id;
          const isPlaying = isActive && playing;
          const gone = missing[n.id];
          return (
            <li
              key={n.id}
              className={`rounded-2xl border px-3 py-2.5 transition-colors ${
                isActive ? "bg-clay-500/10 border-clay-500/30" : "bg-sand-50 border-sand-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(n)}
                  aria-label={isPlaying ? `Pause ${n.title}` : `Play ${n.title}`}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition active:scale-90 ${
                    isActive ? "bg-clay-500 hover:bg-clay-600" : "bg-sage-500 hover:bg-sage-600"
                  }`}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 5l12 7-12 7V5z" />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-800 text-sm text-ink-800 truncate">{n.title}</span>
                    <span dir="rtl" lang="ur" className="font-arabic text-lg text-ink-800 shrink-0">
                      {n.urdu}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-ink-700/50 font-600">
                    <span className="truncate">{gone ? "Audio not added yet" : n.by}</span>
                    {isActive && !gone && (
                      <span className="shrink-0 tabular-nums">
                        {fmt(cur)} / {fmt(dur)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isActive && !gone && dur > 0 && (
                <input
                  type="range"
                  min={0}
                  max={dur}
                  step={1}
                  value={cur}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label={`Seek within ${n.title}`}
                  className="mt-2.5 w-full accent-clay-500"
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
