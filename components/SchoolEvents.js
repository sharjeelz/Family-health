"use client";

import { useState, useEffect } from "react";
import { upcomingEvents } from "../lib/calendar";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtRange(start, finish, showYear) {
  const a = `${MON[start.getMonth()]} ${start.getDate()}`;
  if (finish.getTime() === start.getTime()) {
    return showYear ? `${a}, ${start.getFullYear()}` : a;
  }
  const sameMonth =
    start.getMonth() === finish.getMonth() && start.getFullYear() === finish.getFullYear();
  const b = sameMonth ? `${finish.getDate()}` : `${MON[finish.getMonth()]} ${finish.getDate()}`;
  return `${a}–${b}`;
}

// emoji + accent by rough category, from the title.
function meta(title) {
  const t = title.toLowerCase();
  if (/eid|hajj/.test(t)) return { emoji: "🌙", cls: "text-clay-600 bg-clay-400/15" };
  if (/vacation|break|holiday/.test(t)) return { emoji: "🏖️", cls: "text-clay-600 bg-clay-400/15" };
  if (/exam|pre-board|preparatory leave|result/.test(t)) return { emoji: "📝", cls: "text-clay-600 bg-clay-400/15" };
  if (/test series/.test(t)) return { emoji: "📚", cls: "text-sage-600 bg-sage-500/12" };
  if (/ptm/.test(t)) return { emoji: "🧑‍🏫", cls: "text-sage-600 bg-sage-500/12" };
  if (/re-opens|classes|academic session|teachers return/.test(t)) return { emoji: "🏫", cls: "text-sage-600 bg-sage-500/12" };
  return { emoji: "⭐", cls: "text-date-500 bg-clay-400/12" };
}

function countdown(start, finish, today) {
  if (start <= today && today <= finish) return { label: "Now", cls: "bg-sage-500 text-white" };
  const days = Math.round((start - today) / 86400000);
  if (days === 0) return { label: "Today", cls: "bg-sage-500 text-white" };
  if (days === 1) return { label: "Tomorrow", cls: "bg-clay-500 text-white" };
  return { label: `in ${days} days`, cls: "bg-sand-100 text-ink-700/70" };
}

export default function SchoolEvents() {
  const [today, setToday] = useState(null);
  useEffect(() => {
    const d = new Date();
    setToday(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }, []);

  if (!today) return null;
  const events = upcomingEvents(today, 5);
  const thisYear = today.getFullYear();

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">📅</span>
        <h2 className="font-display text-2xl font-600 text-ink-800">Upcoming events</h2>
      </div>
      <p className="text-sm text-ink-700/55 mb-4">From the school calendar (2026–27).</p>

      {events.length === 0 ? (
        <p className="text-center text-ink-700/45 text-sm py-4">No upcoming events on the calendar.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e, i) => {
            const m = meta(e.title);
            const c = countdown(e.start, e.finish, today);
            return (
              <li
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-sand-50 border border-sand-200 px-3.5 py-3"
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${m.cls}`}
                  aria-hidden="true"
                >
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-800 text-sm text-ink-800 leading-snug">{e.title}</p>
                  <p className="text-xs text-ink-700/50 font-600 mt-0.5">
                    {fmtRange(e.start, e.finish, e.start.getFullYear() !== thisYear)}
                  </p>
                </div>
                <span className={`shrink-0 text-[11px] font-800 px-2.5 py-1 rounded-full ${c.cls}`}>
                  {c.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
