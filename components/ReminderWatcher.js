"use client";

import { useState, useEffect, useRef } from "react";
import { playSound } from "../lib/audio";
import { soundById } from "../lib/sounds";

const KEY = "family-reminders-v1";
const FIRED = "reminder-fired-v1";
const WDAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function loadJSON(k, fb) {
  try {
    return JSON.parse(window.localStorage.getItem(k) || JSON.stringify(fb));
  } catch {
    return fb;
  }
}
const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Global: fires an alert (chime + banner) when a timed reminder comes due, on
// any tab. Only tracks "fired" state (separate key) — never edits the list.
export default function ReminderWatcher() {
  const [toast, setToast] = useState(null); // { texts: [] }
  const timer = useRef(null);

  useEffect(() => {
    const check = () => {
      const items = loadJSON(KEY, []);
      const fired = loadJSON(FIRED, {});
      const now = new Date();
      const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const tk = dayKey(now);
      const due = [];
      let changed = false;

      for (const r of items) {
        if (!r.time || r.done) continue;
        if (r.repeat === "once") {
          if (fired[r.id] !== "fired" && r.due && now.getTime() >= r.due) {
            due.push(r);
            fired[r.id] = "fired";
            changed = true;
          }
        } else {
          const dayOk = r.repeat === "daily" || (r.repeat in WDAY && now.getDay() === WDAY[r.repeat]);
          if (dayOk && r.time === hhmm && fired[r.id] !== tk) {
            due.push(r);
            fired[r.id] = tk;
            changed = true;
          }
        }
      }

      if (changed) {
        try {
          window.localStorage.setItem(FIRED, JSON.stringify(fired));
        } catch {}
      }
      if (due.length) {
        due.forEach((r) => playSound(soundById(r.sound)));
        setToast({ texts: due.map((r) => r.text) });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 30000);
      }
    };

    check();
    const iv = setInterval(check, 20000);
    return () => {
      clearInterval(iv);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <button
        onClick={() => setToast(null)}
        className="pointer-events-auto pop-in w-full max-w-sm flex items-start gap-2.5 rounded-2xl bg-clay-600 text-sand-50 shadow-card px-4 py-3 text-left active:scale-95"
      >
        <span className="text-lg shrink-0" aria-hidden="true">🔔</span>
        <span className="min-w-0">
          <span className="block text-[11px] font-800 uppercase tracking-wider text-sand-100/70">Reminder</span>
          {toast.texts.map((t, i) => (
            <span key={i} className="block text-sm font-800 leading-snug">{t}</span>
          ))}
        </span>
      </button>
    </div>
  );
}
