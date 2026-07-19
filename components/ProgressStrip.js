"use client";

import { HABITS } from "../lib/plan";

export default function ProgressStrip({ history, todayKey }) {
  const max = HABITS.length;
  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <h2 className="font-display text-2xl font-600 text-ink-800 mb-4">This week</h2>
      <div className="flex items-end justify-between gap-2">
        {history.map((h, i) => {
          const pct = max ? h.habitCount / max : 0;
          const isToday = i === history.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-24 rounded-xl bg-sand-100 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-xl transition-all duration-500 ${
                    pct === 1 ? "bg-sage-500" : pct > 0 ? "bg-clay-400" : "bg-transparent"
                  }`}
                  style={{ height: `${Math.max(pct * 100, pct > 0 ? 12 : 0)}%` }}
                />
              </div>
              <span className={`text-xs font-700 ${isToday ? "text-clay-600" : "text-ink-700/50"}`}>
                {h.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center text-ink-700/50 mt-3">
        Green means all {max} habits done. Progress beats perfection.
      </p>
    </section>
  );
}
