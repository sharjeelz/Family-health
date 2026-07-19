"use client";

import { useState, useEffect } from "react";
import { FAMILY, WATER_GOAL, WATER_SCHEDULE } from "../lib/plan";
import { useLang, t } from "../lib/i18n";
import Avatar from "./Avatar";

const CHIME_KEY = "water-chime-v1";

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

const SCHEDULE_MIN = WATER_SCHEDULE.map((s) => {
  const [h, m] = s.time.split(":").map(Number);
  return h * 60 + m;
});

export default function WaterCard({ water, onSet }) {
  const { lang } = useLang();
  const ur = lang === "ur";

  const [nowMin, setNowMin] = useState(null);
  const [chimeOn, setChimeOn] = useState(true);

  useEffect(() => {
    try {
      setChimeOn(window.localStorage.getItem(CHIME_KEY) !== "0");
    } catch {}
  }, []);

  useEffect(() => {
    const upd = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    upd();
    const iv = setInterval(upd, 60000);
    return () => clearInterval(iv);
  }, []);

  function toggleChime() {
    const on = !chimeOn;
    setChimeOn(on);
    try {
      window.localStorage.setItem(CHIME_KEY, on ? "1" : "0");
    } catch {}
  }

  // How many glasses everyone should have had by now (time-based target).
  const dueByNow = nowMin === null ? 0 : SCHEDULE_MIN.filter((m) => m <= nowMin).length;
  let pace = null;
  if (nowMin !== null) {
    const nextIdx = SCHEDULE_MIN.findIndex((m) => m > nowMin);
    pace =
      nextIdx === -1
        ? t("waterDone", lang)
        : `${t("waterNext", lang, to12h(WATER_SCHEDULE[nextIdx].time))} · ${t("waterAim", lang, dueByNow)}`;
  }

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className={`text-2xl text-ink-800 ${ur ? "font-urdu" : "font-display font-600"}`}>
          {t("water", lang)}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleChime}
            aria-label={chimeOn ? "Mute water chime" : "Unmute water chime"}
            aria-pressed={chimeOn}
            className="text-base text-ink-700/40 hover:text-[#2f6d99] transition"
          >
            <span aria-hidden="true">{chimeOn ? "🔔" : "🔕"}</span>
          </button>
          <span className={`text-xs text-ink-700/50 ${ur ? "font-urdu" : "font-600"}`}>
            {t("waterGoal", lang, WATER_GOAL)}
          </span>
        </div>
      </div>
      <p className={`text-sm text-ink-700/60 mb-3 ${ur ? "font-urdu leading-loose" : ""}`}>
        {t("waterSub", lang)}
      </p>

      {/* live pacing reminder */}
      {pace && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#4A90C2]/10 border border-[#4A90C2]/25 px-3 py-2 mb-4">
          <span className="text-base" aria-hidden="true">⏱️</span>
          <span className={`text-sm font-800 text-[#2f6d99] ${ur ? "font-urdu" : ""}`}>{pace}</span>
        </div>
      )}

      <div className="space-y-4">
        {FAMILY.map((person) => {
          const count = water[person.id] || 0;
          const met = count >= WATER_GOAL;
          const behind = Math.max(0, dueByNow - count);
          return (
            <div key={person.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 font-800 text-sm text-ink-800">
                  <Avatar photo={person.photo} pos={person.pos} emoji={person.emoji} size={30} alt={person.name} />
                  {person.name}
                </span>
                <span className="flex items-center gap-2">
                  {!met && dueByNow > 0 && (
                    behind > 0 ? (
                      <span className={`text-[11px] font-800 text-clay-600 bg-clay-400/15 px-2 py-0.5 rounded-full ${ur ? "font-urdu" : ""}`}>
                        {t("waterBehind", lang, behind)}
                      </span>
                    ) : (
                      <span className={`text-[11px] font-800 text-sage-600 bg-sage-500/15 px-2 py-0.5 rounded-full ${ur ? "font-urdu" : ""}`}>
                        {t("waterOnTrack", lang)}
                      </span>
                    )
                  )}
                  <span className={`text-sm font-800 ${met ? "text-sage-600" : "text-ink-700/50"}`}>
                    {count}/{WATER_GOAL}{met ? " ✓" : ""}
                  </span>
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
