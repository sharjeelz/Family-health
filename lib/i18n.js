"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Tiny language layer for the Health (meals) tab: English ⇄ Urdu.
// The choice is remembered on the device.
const LangCtx = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const s = window.localStorage.getItem("lang-v1");
      if (s === "ur" || s === "en") setLangState(s);
    } catch {}
  }, []);

  function setLang(l) {
    setLangState(l);
    try {
      window.localStorage.setItem("lang-v1", l);
    } catch {}
  }

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

// UI string dictionary (headings, labels). Functions take an argument (e.g. a count).
const STR = {
  todaysMeals: { en: "Today's meals", ur: "آج کے کھانے" },
  takeoutDay: { en: "Takeout day", ur: "باہر کے کھانے کا دن" },
  bestTiming: { en: "Best meal timing", ur: "کھانے کے بہترین اوقات" },
  whyHelps: { en: "Why this helps your body", ur: "یہ آپ کے جسم کی کیسے مدد کرتا ہے" },
  breadTitle: { en: "Bread & carb guide", ur: "روٹی اور کاربوہائیڈریٹ گائیڈ" },
  breadSub: {
    en: 'What every "bread" here means — no empty calories',
    ur: "یہاں ہر روٹی کا مطلب — بغیر خالی کیلوریز",
  },
  chooseThese: { en: "Choose these", ur: "یہ چنیں" },
  skipLimit: { en: "Skip / limit", ur: "چھوڑیں / کم کریں" },
  dailyHabits: { en: "Daily habits", ur: "روزمرہ کی عادات" },
  water: { en: "Water", ur: "پانی" },
  waterGoal: {
    en: (n) => `goal ${n} cups each · 240 ml/cup`,
    ur: (n) => `ہدف: فی کس ${n} گلاس · ہر گلاس 240 ملی لیٹر`,
  },
  waterSub: {
    en: "Tap a cup to fill it. Water is the family default drink.",
    ur: "بھرنے کے لیے گلاس پر ٹیپ کریں۔ پانی خاندان کا بنیادی مشروب ہے۔",
  },
  hydrationTitle: { en: "Hydration guide", ur: "پانی پینے کی رہنمائی" },
  hydrationSub: {
    en: "How to spread your cups through the day",
    ur: "دن بھر گلاس کیسے تقسیم کریں",
  },
  suggestedTimes: { en: "Suggested times", ur: "تجویز کردہ اوقات" },
  waterNext: { en: (t) => `Next glass ~${t}`, ur: (t) => `اگلا گلاس ~${t}` },
  waterAim: { en: (n) => `aim ${n} by now`, ur: (n) => `اب تک ${n} کا ہدف` },
  waterOnTrack: { en: "on track", ur: "ٹھیک جا رہے" },
  waterBehind: { en: (n) => `${n} behind`, ur: (n) => `${n} پیچھے` },
  waterDone: {
    en: "You've hit the day's glasses — ease off before bed",
    ur: "دن کے گلاس مکمل — سونے سے پہلے کم کریں",
  },
  thisWeek: { en: "This week", ur: "اس ہفتے" },
  weekNote: {
    en: (n) => `Green means all ${n} habits done. Progress beats perfection.`,
    ur: (n) => `سبز کا مطلب سب ${n} عادات مکمل۔ مکمل ہونے سے بہتر ہے مسلسل کوشش۔`,
  },
};

export function t(key, lang, arg) {
  const entry = STR[key];
  if (!entry) return key;
  const v = entry[lang] ?? entry.en;
  return typeof v === "function" ? v(arg) : v;
}
