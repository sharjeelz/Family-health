"use client";

import { HABITS } from "../lib/plan";

export default function HabitsCard({ checked, onToggle }) {
  const done = HABITS.filter((h) => checked[h.id]).length;

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-600 text-ink-800">Daily habits</h2>
        <span className="text-sm font-800 text-clay-600">
          {done}/{HABITS.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {HABITS.map((habit) => {
          const isOn = !!checked[habit.id];
          return (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              aria-pressed={isOn}
              className={`flex items-center gap-3 rounded-2xl p-3.5 border transition-colors duration-200 text-left ${
                isOn
                  ? "bg-clay-400/10 border-clay-400/30"
                  : "bg-sand-50 border-sand-200 hover:border-sage-500/40"
              }`}
            >
              <span className="text-xl shrink-0" aria-hidden="true">{habit.icon}</span>
              <span className={`flex-1 text-sm font-700 leading-snug ${isOn ? "text-clay-600" : "text-ink-800"}`}>
                {habit.label}
              </span>
              <span
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isOn ? "bg-clay-500 border-clay-500 check-bounce" : "bg-white border-sand-200"
                }`}
              >
                {isOn && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
