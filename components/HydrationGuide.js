"use client";

import { useState } from "react";
import { WATER_SCHEDULE, HYDRATION } from "../lib/plan";
import { WATER_SCHEDULE_UR, HYDRATION_UR } from "../lib/plan_ur";
import { useLang, t } from "../lib/i18n";

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

// Collapsible guide: how to spread the day's water and when to drink each glass.
export default function HydrationGuide({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const { lang } = useLang();
  const ur = lang === "ur";
  const tips = ur ? HYDRATION_UR.tips : HYDRATION.tips;

  return (
    <section className="bg-white rounded-3xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
      >
        <span className="flex items-center gap-3" dir={ur ? "rtl" : undefined}>
          <span className="text-xl" aria-hidden="true">💧</span>
          <span>
            <span className={`block text-2xl text-ink-800 leading-tight ${ur ? "font-urdu" : "font-display font-600"}`}>
              {t("hydrationTitle", lang)}
            </span>
            <span className={`block text-sm text-ink-700/55 ${ur ? "font-urdu" : "font-600"}`}>
              {t("hydrationSub", lang)}
            </span>
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
          {/* timed schedule */}
          <p className={`text-xs uppercase tracking-wider text-sky-700/70 mb-2 ${ur ? "font-urdu" : "font-800"}`}>
            {t("suggestedTimes", lang)}
          </p>
          <ol className="grid grid-cols-2 gap-2 mb-5">
            {WATER_SCHEDULE.map((s, i) => (
              <li
                key={s.time}
                className="flex items-center gap-2 rounded-2xl bg-sand-50 border border-sand-200 px-3 py-2"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#4A90C2]/15 text-[#4A90C2] text-xs font-800 flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-800 text-ink-800 tabular-nums">{to12h(s.time)}</span>
                  <span className={`block text-[11px] text-ink-700/60 truncate ${ur ? "font-urdu" : "font-600"}`}>
                    {ur ? WATER_SCHEDULE_UR[i] : s.label}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {/* tips */}
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className={`flex gap-2 text-sm text-ink-700/80 ${ur ? "font-urdu leading-loose" : "leading-snug"}`}>
                <span className="text-[#4A90C2] shrink-0" aria-hidden="true">💧</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
