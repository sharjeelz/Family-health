"use client";

import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import HomeTab from "../components/HomeTab";
import HealthTab from "../components/HealthTab";
import NamazTab from "../components/NamazTab";
import RemindersTab from "../components/RemindersTab";
import StudyTab from "../components/StudyTab";
import GroceryTab from "../components/GroceryTab";
import AzaanManager from "../components/AzaanManager";
import GuidesFab from "../components/GuidesFab";
import WaterReminder from "../components/WaterReminder";
import ReminderWatcher from "../components/ReminderWatcher";
import { QuranPlayerProvider } from "../components/QuranPlayer";
import { LanguageProvider } from "../lib/i18n";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "health", label: "Health", icon: "🥗" },
  { id: "deen", label: "Deen", icon: "🕌" },
  { id: "study", label: "Study", icon: "📚" },
  { id: "grocery", label: "Grocery", icon: "🛒" },
  { id: "reminders", label: "Reminders", icon: "📝" },
];

export default function Home() {
  const [tab, setTab] = useState("home");
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  // Start each tab from the top instead of keeping the previous tab's scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  return (
    <main className="min-h-screen paper-bg pb-28">
      <AzaanManager />
      <Hero />

      <LanguageProvider>
        <QuranPlayerProvider>
          <div className="max-w-2xl mx-auto px-4 mt-5">
            {tab === "home" && <HomeTab />}
            {tab === "health" && today && <HealthTab today={today} />}
            {tab === "deen" && <NamazTab />}
            {tab === "study" && <StudyTab />}
            {tab === "grocery" && <GroceryTab />}
            {tab === "reminders" && <RemindersTab />}
          </div>
          <GuidesFab />
          <WaterReminder />
          <ReminderWatcher />
        </QuranPlayerProvider>
      </LanguageProvider>

      <footer className="max-w-2xl mx-auto px-4 mt-8 text-center">
        {/* <p className="text-xs text-ink-700/40 font-600 leading-relaxed">
          General guidance, not medical advice. Prayer times use the Umm al-Qura method —
          confirm locally. Your data is saved on this device.
        </p> */}
      </footer>

      {/* Bottom tab bar — fridge/tablet friendly */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-sand-200">
        <div className="max-w-2xl mx-auto px-2 flex">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors"
              >
                <span className={`text-xl transition-transform ${active ? "scale-110" : "opacity-50"}`} aria-hidden="true">
                  {t.icon}
                </span>
                <span className={`text-xs font-800 ${active ? "text-clay-600" : "text-ink-700/45"}`}>
                  {t.label}
                </span>
                <span className={`h-0.5 w-6 rounded-full mt-0.5 ${active ? "bg-clay-500" : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
