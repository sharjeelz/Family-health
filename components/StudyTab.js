"use client";

import { STUDY, CHILDREN } from "../lib/plan";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudyTab() {
  // Show what's needed for TOMORROW (books to pack tonight).
  const today = new Date().getDay();
  const tomorrow = (today + 1) % 7;
  const plan = STUDY[tomorrow] || {};
  const hasAny = CHILDREN.some((c) => (plan[c.id] || []).length > 0);

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-600 text-ink-800">Books for tomorrow</h2>
          <span className="text-xs font-700 text-clay-600 bg-clay-400/15 px-3 py-1 rounded-full">
            {DAYS[tomorrow]}
          </span>
        </div>
        <p className="text-sm text-ink-700/55 mb-4">Pack these tonight so mornings are calm.</p>

        {!hasAny && (
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
                    <span aria-hidden="true">{child.emoji}</span>
                    {child.name}
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
      </section>
    </div>
  );
}
