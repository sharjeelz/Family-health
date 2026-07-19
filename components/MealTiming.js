"use client";

import { useState } from "react";
import { MEAL_TIMING } from "../lib/plan";
import { MEAL_TIMING_UR } from "../lib/plan_ur";
import { useLang, t } from "../lib/i18n";

// Chrononutrition guide: the ideal daily eating schedule and why it helps.
// Rendered as a collapsible card inside the Guides panel.
export default function MealTiming({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const { lang } = useLang();
  const ur = lang === "ur";
  const data = ur ? MEAL_TIMING_UR : MEAL_TIMING;
  const { intro, schedule, why, note } = data;

  return (
    <section className="bg-white rounded-3xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
      >
        <span className="flex items-center gap-3" dir={ur ? "rtl" : undefined}>
          <span className="text-xl" aria-hidden="true">⏰</span>
          <span className={`text-2xl text-ink-800 leading-tight ${ur ? "font-urdu" : "font-display font-600"}`}>
            {t("bestTiming", lang)}
          </span>
        </span>
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="#A9552C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-6 pop-in" dir={ur ? "rtl" : undefined}>
          <p className={`text-sm text-ink-700/60 mb-4 ${ur ? "font-urdu leading-loose" : "leading-snug"}`}>
            {intro}
          </p>

          {/* daily schedule */}
          <ol className="relative border-l-2 border-sand-200 ml-2 space-y-4">
            {schedule.map((s, i) => (
              <li key={i} className="pl-4 relative">
                <span
                  className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-sage-500"
                  aria-hidden="true"
                />
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base" aria-hidden="true">{s.icon}</span>
                  <span className={`text-sm text-ink-800 ${ur ? "font-urdu" : "font-800"}`}>{s.meal}</span>
                  <span className={`text-xs text-clay-600 bg-clay-400/15 px-2 py-0.5 rounded-full ${ur ? "font-urdu" : "font-700"}`}>
                    {s.time}
                  </span>
                </div>
                <p className={`text-sm text-ink-700/70 mt-1 ${ur ? "font-urdu leading-loose" : "leading-snug"}`}>{s.note}</p>
              </li>
            ))}
          </ol>

          {/* why it works */}
          <div className="mt-5 rounded-2xl bg-sage-500/8 border border-sage-500/20 p-4">
            <p className={`text-xs uppercase tracking-wider text-sage-600 mb-2 ${ur ? "font-urdu" : "font-800"}`}>
              {t("whyHelps", lang)}
            </p>
            <ul className="space-y-1.5">
              {why.map((w, i) => (
                <li key={i} className={`flex gap-2 text-sm text-ink-700/80 ${ur ? "font-urdu leading-loose" : "leading-snug"}`}>
                  <span className="text-sage-500 shrink-0" aria-hidden="true">✓</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className={`text-xs text-ink-700/45 mt-4 ${ur ? "font-urdu leading-loose" : "leading-relaxed"}`}>{note}</p>
        </div>
      )}
    </section>
  );
}
