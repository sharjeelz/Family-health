"use client";

import { useState, useEffect } from "react";
import { STUDY, CHILDREN } from "../lib/plan";
import Avatar from "./Avatar";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudyTab() {
  const [today, setToday] = useState(null);
  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  // Find the next school day (starting tomorrow) that actually has subjects, so
  // the weekend never shows an empty list — after Thursday it jumps to Sunday.
  let target = null;
  if (today !== null) {
    for (let i = 1; i <= 7; i++) {
      const d = (today + i) % 7;
      const p = STUDY[d] || {};
      if (CHILDREN.some((c) => (p[c.id] || []).length > 0)) {
        target = d;
        break;
      }
    }
  }

  const plan = target !== null ? STUDY[target] || {} : {};
  const hasAny = target !== null;
  const isTomorrow = target !== null && target === (today + 1) % 7;

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-600 text-ink-800">
            {isTomorrow ? "Books for tomorrow" : hasAny ? `Books for ${DAYS[target]}` : "Study plan"}
          </h2>
          {hasAny && (
            <span className="text-xs font-700 text-clay-600 bg-clay-400/15 px-3 py-1 rounded-full">
              {DAYS[target]}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-700/55 mb-4">
          Pack these the night before so mornings are calm.
        </p>

        {today !== null && !hasAny && (
          <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-6 text-center">
            <p className="text-3xl mb-2" aria-hidden="true">📚</p>
            <p className="text-sm font-700 text-ink-800">Study plan not set up yet</p>
            <p className="text-sm text-ink-700/55 mt-1 leading-snug">
              Add each child's subjects per day and this will show exactly which
              books to pack for the next school day.
            </p>
          </div>
        )}

        {hasAny && (
          <div className="space-y-4">
            {CHILDREN.map((child) => {
              const subjects = plan[child.id] || [];
              return (
                <div key={child.id}>
                  <p className="flex items-center gap-2 font-800 text-sm text-ink-800 mb-2">
                    <Avatar photo={child.photo} pos={child.pos} emoji={child.emoji} size={34} alt={child.name} />
                    {child.name}
                    {child.school && (
                      <span className="font-600 text-ink-700/45">· {child.school}</span>
                    )}
                  </p>
                  {subjects.length === 0 ? (
                    <p className="text-sm text-ink-700/45 pl-6">No books needed — enjoy!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pl-6">
                      {subjects.map((s, i) => (
                        <span key={i} className="text-sm font-700 text-sage-600 bg-sage-500/10 border border-sage-500/25 rounded-xl px-3 py-1.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasAny && (
          <p className="text-xs text-ink-700/45 mt-6 leading-relaxed border-t border-sand-200 pt-3">
            Nursery activities are expanded from the school's codes — CT (Circle
            Time), EA (English Activity), IK (Islamic Knowledge), FT (Fun Time),
            UA (Urdu Activity), MA (Math Activity), A&amp;C (Art &amp; Craft).
          </p>
        )}
      </section>
    </div>
  );
}
