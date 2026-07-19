"use client";

import { MEAL_SLOTS } from "../lib/plan";
import { SLOTS_UR, WEEK_UR } from "../lib/plan_ur";
import { useLang, t } from "../lib/i18n";

export default function MealCard({ dayData, dayIndex, checked, onToggle }) {
  const { lang } = useLang();
  const ur = lang === "ur";

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2
          dir={ur ? "rtl" : undefined}
          className={`text-2xl text-ink-800 ${ur ? "font-urdu" : "font-display font-600"}`}
        >
          {t("todaysMeals", lang)}
        </h2>
        {dayData.takeout && (
          <span className={`text-xs font-700 uppercase tracking-wide text-clay-600 bg-clay-400/15 px-3 py-1 rounded-full ${ur ? "font-urdu" : ""}`}>
            {t("takeoutDay", lang)}
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {MEAL_SLOTS.map((slot) => {
          const isOn = !!checked[slot.id];
          const label = ur ? SLOTS_UR[slot.id]?.label : slot.label;
          const time = ur ? SLOTS_UR[slot.id]?.time : slot.time;
          const meal = ur ? WEEK_UR[dayIndex]?.[slot.id] : dayData.meals[slot.id];
          return (
            <li key={slot.id}>
              <button
                onClick={() => onToggle(slot.id)}
                aria-pressed={isOn}
                className={`w-full text-left flex items-start gap-3.5 rounded-2xl p-3.5 transition-colors duration-200 border ${
                  isOn
                    ? "bg-sage-500/10 border-sage-500/30"
                    : "bg-sand-50 border-sand-200 hover:border-clay-400/40"
                }`}
              >
                <span
                  className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isOn
                      ? "bg-sage-500 border-sage-500 check-bounce"
                      : "bg-white border-sand-200"
                  }`}
                >
                  {isOn && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="flex-1 min-w-0" dir={ur ? "rtl" : undefined}>
                  <span className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-sm ${ur ? "font-urdu" : "font-800"} ${isOn ? "text-sage-600" : "text-ink-800"}`}>
                      {label}
                    </span>
                    <span className={`text-xs text-ink-700/50 ${ur ? "font-urdu" : "font-600"}`}>{time}</span>
                  </span>
                  <span className={`block text-sm mt-0.5 ${ur ? "font-urdu leading-loose" : "leading-snug"} ${isOn ? "text-ink-700/70 line-through" : "text-ink-700/80"}`}>
                    {meal}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
