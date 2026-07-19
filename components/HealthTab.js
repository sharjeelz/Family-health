"use client";

import { useMemo } from "react";
import { WEEK, TIPS, HABITS } from "../lib/plan";
import { useTracker, dateKey } from "../lib/useTracker";
import MealCard from "./MealCard";
import BreadGuide from "./BreadGuide";
import HabitsCard from "./HabitsCard";
import WaterCard from "./WaterCard";
import ProgressStrip from "./ProgressStrip";

export default function HealthTab({ today }) {
  const { ready, day, toggleMeal, toggleHabit, setWater, history } = useTracker(today);

  const weekdayIndex = today.getDay();
  const plan = WEEK[weekdayIndex];

  const tip = useMemo(() => TIPS[today.getDate() % TIPS.length], [today]);
  const hist = ready ? history(7) : [];
  const habitsDone = HABITS.filter((h) => day.habits[h.id]).length;

  if (!ready) {
    return <div className="text-center text-ink-700/40 font-600 py-10">Loading your day…</div>;
  }

  return (
    <div className="space-y-5">
      {/* Tip + habit count row */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 bg-ink-800 text-sand-50 rounded-2xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-lg shrink-0" aria-hidden="true">💡</span>
          <p className="text-sm font-600 leading-snug self-center">{tip}</p>
        </div>
        <div className="shrink-0 bg-white rounded-2xl shadow-soft px-4 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-700 text-sage-600 leading-none">{habitsDone}</span>
          <span className="text-[10px] text-ink-700/50 font-700 mt-0.5">of {HABITS.length}</span>
        </div>
      </div>

      <MealCard dayData={plan} checked={day.meals} onToggle={toggleMeal} />
      <BreadGuide />
      <HabitsCard checked={day.habits} onToggle={toggleHabit} />
      <WaterCard water={day.water} onSet={setWater} />
      <ProgressStrip history={hist} todayKey={dateKey(today)} />
    </div>
  );
}
