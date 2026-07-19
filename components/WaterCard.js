"use client";

import { FAMILY, WATER_GOAL } from "../lib/plan";

function Drop({ filled }) {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" aria-hidden="true" className="transition-all">
      <path
        d="M10 1C10 1 2 10 2 15a8 8 0 0 0 16 0c0-5-8-14-8-14z"
        fill={filled ? "#4A90C2" : "none"}
        stroke={filled ? "#4A90C2" : "#C9BBA3"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function WaterCard({ water, onSet }) {
  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-2xl font-600 text-ink-800">Water</h2>
        <span className="text-xs text-ink-700/50 font-600">goal {WATER_GOAL} cups each</span>
      </div>
      <p className="text-sm text-ink-700/60 mb-4">Tap a cup to fill it. Water is the family default drink.</p>

      <div className="space-y-4">
        {FAMILY.map((person) => {
          const count = water[person.id] || 0;
          const met = count >= WATER_GOAL;
          return (
            <div key={person.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 font-800 text-sm text-ink-800">
                  <span aria-hidden="true">{person.emoji}</span>
                  {person.name}
                </span>
                <span className={`text-sm font-800 ${met ? "text-sage-600" : "text-ink-700/50"}`}>
                  {count}/{WATER_GOAL}{met ? " ✓" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: WATER_GOAL }).map((_, i) => {
                  const cupNum = i + 1;
                  const filled = cupNum <= count;
                  return (
                    <button
                      key={i}
                      onClick={() => onSet(person.id, filled && cupNum === count ? count - 1 : cupNum)}
                      aria-label={`${person.name} cup ${cupNum}`}
                      className="p-1 rounded-lg hover:bg-sand-100 active:scale-90 transition-transform"
                    >
                      <Drop filled={filled} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
