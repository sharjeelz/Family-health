"use client";

import { useState, useEffect } from "react";
import { WEEK, STUDY, CHILDREN } from "../lib/plan";

const REMINDER_KEY = "family-reminders-v1";

function to12h(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

// The bits worth knowing without opening a tab: what's for dinner, what the
// kids need packed for tomorrow, and what's still outstanding today. Pulls from
// the same data as the Health, Study and Reminders tabs.
export default function TodayGlance() {
  const [today, setToday] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    setToday(new Date());
    try {
      const saved = JSON.parse(window.localStorage.getItem(REMINDER_KEY) || "[]");
      setReminders(Array.isArray(saved) ? saved : []);
    } catch {
      setReminders([]);
    }
  }, []);

  if (!today) return null;

  const dow = today.getDay();
  const dinner = WEEK[dow]?.meals?.dinner;
  const takeout = WEEK[dow]?.takeout;

  // Books get packed the night before, so show tomorrow's timetable.
  const tomorrowDow = (dow + 1) % 7;
  const tomorrowName = new Date(today.getTime() + 86400000).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const packing = CHILDREN.map((c) => ({
    ...c,
    subjects: STUDY[tomorrowDow]?.[c.id] || [],
  })).filter((c) => c.subjects.length > 0);

  const open = reminders.filter((r) => !r.done);

  return (
    <section className="bg-white rounded-3xl shadow-card p-5">
      <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
        Today at a glance
      </p>

      <div className="grid gap-3 wall:grid-cols-3">
        {/* Dinner */}
        <div className="rounded-2xl bg-sand-50 border border-sand-200 p-4">
          <p className="text-clay-600 font-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            Dinner
            {takeout && (
              <span className="ml-auto text-[0.6rem] bg-clay-500 text-white rounded-full px-2 py-0.5">
                TAKEOUT
              </span>
            )}
          </p>
          <p className="text-ink-800 font-600 text-sm mt-2 leading-relaxed">
            {dinner || "Nothing planned"}
          </p>
        </div>

        {/* Tomorrow's bags */}
        <div className="rounded-2xl bg-sand-50 border border-sand-200 p-4">
          <p className="text-sage-600 font-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            Pack for {tomorrowName}
          </p>
          {packing.length === 0 ? (
            <p className="text-ink-700/50 font-600 text-sm mt-2">No school — enjoy!</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {packing.map((c) => (
                <div key={c.id}>
                  <p className="text-ink-800 font-800 text-xs">
                    {c.name}
                  </p>
                  <p className="text-ink-700/60 font-600 text-xs leading-relaxed">
                    {c.subjects.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outstanding reminders */}
        <div className="rounded-2xl bg-sand-50 border border-sand-200 p-4">
          <p className="text-ink-700/60 font-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            Reminders
            {open.length > 0 && (
              <span className="ml-auto text-[0.6rem] bg-ink-800 text-sand-50 rounded-full px-2 py-0.5">
                {open.length}
              </span>
            )}
          </p>
          {open.length === 0 ? (
            <p className="text-ink-700/50 font-600 text-sm mt-2">All clear</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {open.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-baseline gap-2">
                  <span className="text-ink-800 font-600 text-xs leading-relaxed flex-1 min-w-0">
                    {r.text}
                  </span>
                  {r.time && (
                    <span className="text-clay-600 font-800 text-[0.65rem] tabular-nums shrink-0">
                      {to12h(r.time)}
                    </span>
                  )}
                </li>
              ))}
              {open.length > 4 && (
                <li className="text-ink-700/40 font-700 text-[0.65rem]">
                  +{open.length - 4} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
