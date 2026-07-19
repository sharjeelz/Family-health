"use client";

import { useMemo } from "react";
import { WEEK, TIPS } from "../lib/plan";
import { TIPS_UR } from "../lib/plan_ur";
import { useLang } from "../lib/i18n";
import { useTracker } from "../lib/useTracker";
import MealCard from "./MealCard";
import WaterCard from "./WaterCard";

export default function HealthTab({ today }) {
  const { ready, day, toggleMeal, setWater } = useTracker(today);
  const { lang, setLang } = useLang();
  const ur = lang === "ur";

  const weekdayIndex = today.getDay();
  const plan = WEEK[weekdayIndex];

  const tipIndex = useMemo(() => today.getDate() % TIPS.length, [today]);
  const tip = ur ? TIPS_UR[tipIndex] : TIPS[tipIndex];

  if (!ready) {
    return <div className="text-center text-ink-700/40 font-600 py-10">Loading your day…</div>;
  }

  return (
    <div className="space-y-5" dir={ur ? "rtl" : "ltr"}>
      {/* Language toggle — helps Mom read the meals in Urdu */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-full bg-white shadow-soft p-1 text-xs font-800">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-full transition ${
              !ur ? "bg-sage-500 text-white" : "text-ink-700/60"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang("ur")}
            className={`px-3 py-1.5 rounded-full transition font-urdu ${
              ur ? "bg-sage-500 text-white" : "text-ink-700/60"
            }`}
          >
            اردو
          </button>
        </div>
      </div>

      {/* Daily tip */}
      <div className="bg-ink-800 text-sand-50 rounded-2xl px-4 py-3 flex items-start gap-2.5">
        <span className="text-lg shrink-0" aria-hidden="true">💡</span>
        <p
          dir={ur ? "rtl" : undefined}
          className={`text-sm leading-snug self-center ${ur ? "font-urdu leading-loose" : "font-600"}`}
        >
          {tip}
        </p>
      </div>

      <MealCard dayData={plan} dayIndex={weekdayIndex} checked={day.meals} onToggle={toggleMeal} />
      <WaterCard water={day.water} onSet={setWater} />
    </div>
  );
}
