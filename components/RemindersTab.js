"use client";

import { useState, useEffect } from "react";
import { REMINDER_SOUNDS, soundById } from "../lib/sounds";
import { playSound } from "../lib/audio";

const KEY = "family-reminders-v1";

const REPEATS = [
  { v: "once", label: "Once" },
  { v: "daily", label: "Every day" },
  { v: "sun", label: "Sunday" },
  { v: "mon", label: "Monday" },
  { v: "tue", label: "Tuesday" },
  { v: "wed", label: "Wednesday" },
  { v: "thu", label: "Thursday" },
  { v: "fri", label: "Friday" },
  { v: "sat", label: "Saturday" },
];

function load() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`;
}
// Next moment "HH:MM" occurs (today if still ahead, else tomorrow).
function nextOccurrence(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = new Date();
  t.setHours(h, m, 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
  return t.getTime();
}
function scheduleLabel(r) {
  if (!r.time) return null;
  const dayMap = { once: "", daily: "Every day · ", sun: "Sun · ", mon: "Mon · ", tue: "Tue · ", wed: "Wed · ", thu: "Thu · ", fri: "Fri · ", sat: "Sat · " };
  return (dayMap[r.repeat] || "") + to12h(r.time);
}

export default function RemindersTab() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("once");
  const [sound, setSound] = useState("chime");
  const [editingId, setEditingId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  function persist(next) {
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function resetForm() {
    setText("");
    setTime("");
    setRepeat("once");
    setSound("chime");
    setEditingId(null);
  }

  function save() {
    const t = text.trim();
    if (!t) return;
    const fields = { text: t, time: time || null, repeat: time ? repeat : null, sound: time ? sound : null };
    const due = time && repeat === "once" ? nextOccurrence(time) : null;
    if (editingId != null) {
      persist(items.map((it) => (it.id === editingId ? { ...it, ...fields, due } : it)));
      // let the edited reminder alert again with its new schedule
      try {
        const f = JSON.parse(window.localStorage.getItem("reminder-fired-v1") || "{}");
        delete f[editingId];
        window.localStorage.setItem("reminder-fired-v1", JSON.stringify(f));
      } catch {}
    } else {
      persist([{ id: Date.now(), done: false, ...fields, due }, ...items]);
    }
    resetForm();
  }

  function startEdit(r) {
    setEditingId(r.id);
    setText(r.text);
    setTime(r.time || "");
    setRepeat(r.repeat || "once");
    setSound(r.sound || "chime");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggle(id) {
    persist(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  }
  function remove(id) {
    persist(items.filter((it) => it.id !== id));
  }

  const active = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-600 text-ink-800 mb-4">Family reminders</h2>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={editingId ? "Edit reminder…" : "Add a reminder…"}
            className="flex-1 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-600 text-ink-800 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-400"
          />
          <button
            onClick={save}
            className="shrink-0 rounded-2xl bg-clay-500 text-white font-800 px-5 py-3 text-sm hover:bg-clay-600 active:scale-95 transition"
          >
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="shrink-0 rounded-2xl bg-sand-50 border border-sand-200 text-ink-700/70 font-800 px-4 py-3 text-sm hover:border-clay-400 active:scale-95 transition"
            >
              Cancel
            </button>
          )}
        </div>

        {/* optional time + repeat */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-base" aria-hidden="true">⏰</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Reminder time"
            className="rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-700 text-ink-800 focus:outline-none focus:border-clay-400"
          />
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            aria-label="Repeat"
            className="flex-1 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-700 text-ink-800 focus:outline-none focus:border-clay-400"
          >
            {REPEATS.map((r) => (
              <option key={r.v} value={r.v}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* sound picker + preview (only matters for timed reminders) */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base" aria-hidden="true">🔊</span>
          <select
            value={sound}
            onChange={(e) => setSound(e.target.value)}
            aria-label="Alert sound"
            className="flex-1 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-700 text-ink-800 focus:outline-none focus:border-clay-400"
          >
            {REMINDER_SOUNDS.map((s) => (
              <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
            ))}
          </select>
          <button
            onClick={() => playSound(soundById(sound))}
            aria-label="Preview sound"
            className="shrink-0 rounded-xl bg-sand-50 border border-sand-200 px-3 py-2 text-sm font-800 text-ink-700/80 hover:border-clay-400 hover:text-clay-600 active:scale-95 transition"
          >
            ▶ Test
          </button>
        </div>
        <p className="text-xs text-ink-700/45 mt-2">
          Add a time to get an alert (sound + banner) when it's due — even on other tabs.
        </p>

        {ready && items.length === 0 && (
          <p className="text-center text-ink-700/45 text-sm mt-6 py-4">
            Nothing yet. Add the first family reminder above.
          </p>
        )}

        {active.length > 0 && (
          <ul className="mt-4 space-y-2">
            {active.map((it) => (
              <li
                key={it.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  editingId === it.id ? "bg-clay-400/10 border-clay-400/40" : "bg-sand-50 border-sand-200"
                }`}
              >
                <button
                  onClick={() => toggle(it.id)}
                  aria-label="Mark done"
                  className="shrink-0 w-6 h-6 rounded-full border-2 border-sand-200 bg-white hover:border-sage-500 transition"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-700 text-ink-800">{it.text}</span>
                  {scheduleLabel(it) && (
                    <span className="inline-flex items-center gap-1 text-xs font-700 text-clay-600 bg-clay-400/15 px-2 py-0.5 rounded-full mt-1">
                      {soundById(it.sound).emoji} {scheduleLabel(it)}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => startEdit(it)}
                  aria-label="Edit"
                  className="shrink-0 text-ink-700/30 hover:text-clay-500 transition text-base leading-none"
                >
                  ✎
                </button>
                <button
                  onClick={() => remove(it.id)}
                  aria-label="Delete"
                  className="shrink-0 text-ink-700/30 hover:text-clay-500 transition text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <>
            <p className="text-xs font-800 text-ink-700/40 uppercase tracking-wider mt-6 mb-2">Done</p>
            <ul className="space-y-2">
              {done.map((it) => (
                <li key={it.id} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 opacity-60">
                  <button
                    onClick={() => toggle(it.id)}
                    aria-label="Mark not done"
                    className="shrink-0 w-6 h-6 rounded-full bg-sage-500 border-2 border-sage-500 flex items-center justify-center"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm font-600 text-ink-700/60 line-through">{it.text}</span>
                  <button
                    onClick={() => remove(it.id)}
                    aria-label="Delete"
                    className="shrink-0 text-ink-700/30 hover:text-clay-500 transition text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
