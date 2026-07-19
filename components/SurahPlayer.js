"use client";

import { SURAHS } from "../lib/surahs";
import { useQuranPlayer } from "./QuranPlayer";

function fmt(t) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// The Deen tab's surah list. Playback is handled by the app-level QuranPlayer
// so it keeps going when you switch tabs.
export default function SurahPlayer() {
  const { activeId, playing, cur, dur, missing, toggle, seek } = useQuranPlayer();

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">📖</span>
        <h2 className="font-display text-2xl font-600 text-ink-800">Listen to Qur'an</h2>
      </div>
      <p className="text-sm text-ink-700/55 mb-4">Tap a surah to play it anytime — keeps playing across tabs.</p>

      <ul className="space-y-2">
        {SURAHS.map((s) => {
          const isActive = activeId === s.id;
          const isPlaying = isActive && playing;
          const gone = missing[s.id];
          return (
            <li
              key={s.id}
              className={`rounded-2xl border px-3 py-2.5 transition-colors ${
                isActive ? "bg-sage-500/10 border-sage-500/30" : "bg-sand-50 border-sand-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(s)}
                  aria-label={isPlaying ? `Pause ${s.name}` : `Play ${s.name}`}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition active:scale-90 ${
                    isActive ? "bg-sage-500 hover:bg-sage-600" : "bg-clay-500 hover:bg-clay-600"
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
                    <span className="font-800 text-sm text-ink-800 truncate">
                      {s.num}. {s.name}
                    </span>
                    <span dir="rtl" lang="ar" className="font-arabic text-lg text-ink-800 shrink-0">
                      {s.arabic}
                    </span>
                  </div>
                  <span className="block text-xs text-ink-700/50 font-600">
                    {gone ? "Audio not added yet" : `${s.meaning} · ${s.ayahs} ayahs`}
                  </span>
                </div>
              </div>

              {isActive && !gone && (
                <div className="flex items-center gap-2 mt-2.5 pl-1">
                  <span className="text-[11px] font-700 text-ink-700/50 tabular-nums w-9 text-right">
                    {fmt(cur)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={dur || 0}
                    value={cur}
                    onChange={(e) => seek(Number(e.target.value))}
                    aria-label="Seek"
                    className="flex-1 h-1.5 accent-sage-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-700 text-ink-700/50 tabular-nums w-9">
                    {fmt(dur)}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
