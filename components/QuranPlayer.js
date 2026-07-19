"use client";

import { createContext, useContext, useRef, useState } from "react";
import { SURAHS, surahSrc } from "../lib/surahs";

// A single, app-level audio player so recitation keeps playing when you switch
// tabs. The <audio> element and playback state live here (mounted once at the
// root); the Deen tab's list and the mini "now playing" bar both drive it.
const Ctx = createContext(null);

export function useQuranPlayer() {
  return useContext(Ctx);
}

export function QuranPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const activeIdRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [missing, setMissing] = useState({});

  function toggle(s) {
    const a = audioRef.current;
    if (!a) return;
    if (activeId === s.id) {
      if (playing) a.pause();
      else a.play().catch(() => {});
      return;
    }
    activeIdRef.current = s.id;
    setActiveId(s.id);
    setCur(0);
    setDur(0);
    a.src = surahSrc(s);
    a.play().catch(() => {
      setMissing((m) => ({ ...m, [s.id]: true }));
      activeIdRef.current = null;
      setActiveId(null);
      setPlaying(false);
    });
  }

  function seek(tSec) {
    const a = audioRef.current;
    if (a && dur) a.currentTime = tSec;
  }

  function stop() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    activeIdRef.current = null;
    setActiveId(null);
    setPlaying(false);
  }

  const value = { activeId, playing, cur, dur, missing, toggle, seek, stop };

  return (
    <Ctx.Provider value={value}>
      {children}
      <NowPlaying />
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCur(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDur(audioRef.current?.duration || 0)}
        onEnded={() => {
          setPlaying(false);
          activeIdRef.current = null;
          setActiveId(null);
        }}
        onError={() => {
          const id = activeIdRef.current;
          if (id) {
            setMissing((m) => ({ ...m, [id]: true }));
            activeIdRef.current = null;
            setActiveId(null);
            setPlaying(false);
          }
        }}
      />
    </Ctx.Provider>
  );
}

// Compact global control that appears whenever a surah is loaded.
function NowPlaying() {
  const { activeId, playing, toggle, stop } = useQuranPlayer();
  if (!activeId) return null;
  const s = SURAHS.find((x) => x.id === activeId);
  if (!s) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 rounded-full bg-ink-900/95 text-sand-50 shadow-card backdrop-blur-sm pl-2 pr-3 py-2">
        <button
          onClick={() => toggle(s)}
          aria-label={playing ? "Pause" : "Play"}
          className="shrink-0 w-9 h-9 rounded-full bg-sage-500 hover:bg-sage-600 flex items-center justify-center active:scale-90 transition"
        >
          {playing ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5l12 7-12 7V5z" />
            </svg>
          )}
        </button>
        <span className="min-w-0 flex-1 text-sm font-800 truncate">
          {s.name} <span className="text-sand-200/60 font-600">· {s.meaning}</span>
        </span>
        <span dir="rtl" lang="ar" className="font-arabic text-lg shrink-0">{s.arabic}</span>
        <button
          onClick={stop}
          aria-label="Stop"
          className="shrink-0 text-sand-200/60 hover:text-sand-50 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
