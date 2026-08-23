"use client";

import { useState, useEffect } from "react";
import { STUDY, CHILDREN } from "../lib/plan";
import Avatar from "./Avatar";

const REMINDER_KEY = "family-reminders-v1";
const GROCERY_KEY = "family-grocery-v1";

function to12h(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
}

// Each panel gets its own accent rather than three identical beige boxes, so
// the eye can tell them apart from across the kitchen without reading a word.
function Panel({ title, accent, count, children }) {
  const tone = {
    clay: { tint: "bg-clay-400/[0.07] border-clay-400/25", label: "text-clay-600", pill: "bg-clay-500" },
    sage: { tint: "bg-sage-500/[0.07] border-sage-500/25", label: "text-sage-600", pill: "bg-sage-500" },
    ink: { tint: "bg-ink-800/[0.05] border-ink-800/15", label: "text-ink-700/70", pill: "bg-ink-800" },
  }[accent];

  return (
    <div className={`rounded-2xl border p-4 ${tone.tint}`}>
      <p className={`font-800 text-[0.7rem] uppercase tracking-wider flex items-center gap-2 ${tone.label}`}>
        {title}
        {count > 0 && (
          <span className={`ml-auto text-[0.65rem] text-white rounded-full px-2 py-0.5 ${tone.pill}`}>
            {count}
          </span>
        )}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// Nothing to do is good news, so it should look settled rather than like
// missing data in grey.
function AllDone({ children }) {
  return (
    <p className="text-ink-700/45 font-700 text-sm flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-sage-500/15 text-sage-600 flex items-center justify-center text-[0.7rem] font-900 shrink-0">
        ✓
      </span>
      {children}
    </p>
  );
}

// The bits worth knowing without opening a tab: what still needs buying, what
// the kids need packed for tomorrow, and what's outstanding today. Reads the
// same stored lists as the Grocery and Reminders tabs.
export default function TodayGlance() {
  const [today, setToday] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [grocery, setGrocery] = useState([]);

  useEffect(() => {
    setToday(new Date());
    try {
      const saved = JSON.parse(window.localStorage.getItem(REMINDER_KEY) || "[]");
      setReminders(Array.isArray(saved) ? saved : []);
    } catch {
      setReminders([]);
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem(GROCERY_KEY) || "[]");
      setGrocery(Array.isArray(saved) ? saved : []);
    } catch {
      setGrocery([]);
    }
  }, []);

  if (!today) return null;

  const dow = today.getDay();
  const toBuy = grocery.filter((g) => !g.done);

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
      <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-4">
        Today at a glance
      </p>

      <div className="grid gap-3 items-start wall:grid-cols-2">
        <Panel title="Shopping" accent="clay" count={toBuy.length}>
          {toBuy.length === 0 ? (
            <AllDone>Nothing to buy</AllDone>
          ) : (
            <ul className="space-y-1.5">
              {toBuy.slice(0, 5).map((g) => (
                <li key={g.id} className="text-ink-800 font-600 text-sm leading-snug flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay-400 mt-1.5 shrink-0" />
                  <span className="min-w-0">{g.text}</span>
                </li>
              ))}
              {toBuy.length > 5 && (
                <li className="text-ink-700/40 font-700 text-xs pl-3.5">+{toBuy.length - 5} more</li>
              )}
            </ul>
          )}
        </Panel>

        <Panel title="Reminders" accent="ink" count={open.length}>
          {open.length === 0 ? (
            <AllDone>All clear</AllDone>
          ) : (
            <ul className="space-y-2">
              {open.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-baseline gap-2">
                  <span className="text-ink-800 font-600 text-sm leading-snug flex-1 min-w-0">
                    {r.text}
                  </span>
                  {r.time && (
                    <span className="text-clay-600 font-800 text-[0.7rem] tabular-nums shrink-0">
                      {to12h(r.time)}
                    </span>
                  )}
                </li>
              ))}
              {open.length > 4 && (
                <li className="text-ink-700/40 font-700 text-xs">+{open.length - 4} more</li>
              )}
            </ul>
          )}
        </Panel>
      </div>

      {/* Packing takes a row of its own: the subject chips need width to run
          horizontally instead of stacking one per line. */}
      <div className="mt-3">
        <Panel title={`Pack for ${tomorrowName}`} accent="sage">
          {packing.length === 0 ? (
            <AllDone>No school tomorrow</AllDone>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {packing.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar photo={c.photo} pos={c.pos} alt={c.name} size={28} />
                  <div className="min-w-0">
                    <p className="text-ink-800 font-800 text-sm leading-none mb-1.5">{c.name}</p>
                    {/* Chips rather than a run-on line: at a glance you count
                        books, you don't read them. */}
                    <div className="flex flex-wrap gap-1">
                      {c.subjects.map((s) => (
                        <span
                          key={s}
                          className="text-[0.7rem] font-700 text-ink-700/70 bg-white/70 border border-sand-200 rounded-full px-2 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}
