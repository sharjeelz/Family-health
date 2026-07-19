"use client";

import { useState, useEffect, useRef } from "react";
import { WATER_SCHEDULE } from "../lib/plan";
import { useLang, t } from "../lib/i18n";
import { playChime, installAudioArmer } from "../lib/audio";

const CHIME_KEY = "water-chime-v1";

const SCHEDULE_MIN = WATER_SCHEDULE.map((s) => {
  const [h, m] = s.time.split(":").map(Number);
  return h * 60 + m;
});

// Global (works on any tab): when a scheduled glass time passes while the app
// is open, show a dismissible toast and — if the chime is on — play a soft
// two-note chime.
export default function WaterReminder() {
  const { lang } = useLang();
  const [toast, setToast] = useState(false);
  const prevDueRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => installAudioArmer(), []);

  useEffect(() => {
    const check = () => {
      const d = new Date();
      const m = d.getHours() * 60 + d.getMinutes();
      const due = SCHEDULE_MIN.filter((x) => x <= m).length;
      // Fire only on a live crossing, not on first load / catch-up.
      if (prevDueRef.current !== null && due > prevDueRef.current) {
        let chimeOn = true;
        try {
          chimeOn = window.localStorage.getItem(CHIME_KEY) !== "0";
        } catch {}
        if (chimeOn) playChime();
        setToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 15000);
      }
      prevDueRef.current = due;
    };
    check();
    const iv = setInterval(check, 30000);
    return () => {
      clearInterval(iv);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  if (!toast) return null;
  const ur = lang === "ur";

  return (
    <div className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <button
        onClick={() => setToast(false)}
        className="pointer-events-auto pop-in flex items-center gap-2 rounded-full bg-[#2f6d99] text-white shadow-card pl-3 pr-4 py-2.5 active:scale-95"
      >
        <span className="text-lg" aria-hidden="true">💧</span>
        <span className={`text-sm font-800 ${ur ? "font-urdu" : ""}`}>{t("waterToast", lang)}</span>
      </button>
    </div>
  );
}
