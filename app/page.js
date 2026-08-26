"use client";

import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import HomeTab from "../components/HomeTab";
import HealthTab from "../components/HealthTab";
import NamazTab from "../components/NamazTab";
import RemindersTab from "../components/RemindersTab";
import StudyTab from "../components/StudyTab";
import KitchenTab from "../components/KitchenTab";
import CamerasTab from "../components/CamerasTab";
import ChoresTab from "../components/ChoresTab";
import GroceryTab from "../components/GroceryTab";
import AzaanManager from "../components/AzaanManager";
import KeepAwake from "../components/KeepAwake";
import AmbientBackground from "../components/AmbientBackground";
import GuidesFab from "../components/GuidesFab";
import SosButton from "../components/SosButton";
import CallScreen from "../components/CallScreen";
import WaterReminder from "../components/WaterReminder";
import ReminderWatcher from "../components/ReminderWatcher";
import { QuranPlayerProvider } from "../components/QuranPlayer";
import { LanguageProvider } from "../lib/i18n";

// Health, Study and Chores are hidden for now. Their panels below are left
// wired up, so uncommenting a line here brings the tab straight back.
const TABS = [
  { id: "home", label: "Home" },
  // { id: "health", label: "Health" },
  { id: "deen", label: "Deen" },
  { id: "study", label: "Study" },
  // { id: "chores", label: "Chores" },
  { id: "kitchen", label: "MyKitchen" },
  { id: "cameras", label: "Cams" },
  { id: "grocery", label: "Grocery" },
  { id: "reminders", label: "Reminders" },
];

// Matches the `wall` screen in tailwind.config.js. Kept in JS as well so we can
// mount a single Hero instead of one per layout (two would mean two clocks and
// two weather fetches). Starts false so SSR and first paint agree.
const WALL_QUERY = "(min-width: 900px) and (orientation: landscape)";

function useWallLayout() {
  const [isWall, setIsWall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(WALL_QUERY);
    const sync = () => setIsWall(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isWall;
}

export default function Home() {
  const [tab, setTab] = useState("home");
  // Bumped on every nav tap. The panel is keyed on it, so tapping a tab —
  // including the one already open — remounts it and it refetches. Without
  // this you have to leave a tab and come back to see fresh data.
  const [navCount, setNavCount] = useState(0);
  const openTab = (id) => {
    setTab(id);
    setNavCount((n) => n + 1);
  };
  const [today, setToday] = useState(null);
  const isWall = useWallLayout();

  useEffect(() => {
    setToday(new Date());
  }, []);

  // Start each tab from the top instead of keeping the previous tab's scroll.
  // On the wall layout the page itself never scrolls — the content pane does.
  useEffect(() => {
    if (isWall) {
      document.getElementById("tab-pane")?.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [tab, navCount, isWall]);

  const panels = (
    <div key={`${tab}-${navCount}`}>
      {tab === "home" && <HomeTab />}
      {tab === "health" && today && <HealthTab today={today} />}
      {tab === "deen" && <NamazTab />}
      {tab === "study" && <StudyTab />}
      {tab === "chores" && <ChoresTab />}
      {tab === "kitchen" && <KitchenTab />}
      {tab === "cameras" && <CamerasTab />}
      {tab === "grocery" && <GroceryTab />}
      {tab === "reminders" && <RemindersTab />}
    </div>
  );

  const overlays = (
    <>
      <GuidesFab />
      <SosButton />
      <CallScreen />
      <WaterReminder />
      <ReminderWatcher />
    </>
  );

  if (isWall) {
    return (
      <main className="h-screen overflow-hidden paper-bg flex">
        <KeepAwake />
        <AmbientBackground />
        <AzaanManager />

        {/* Left rail: the always-on glanceable half — clock, date, weather, nav */}
        <aside className="relative shrink-0 w-72 wallwide:w-80 bg-ink-900 flex flex-col overflow-hidden">
          {/* One wash across the whole rail — inside the Hero it stopped at the
              hero's height and left a visible seam above the nav. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70 transition-[background-image] duration-[4s]"
            style={{
              background:
                "radial-gradient(120% 40% at 100% 0%, var(--amb-rail-1, rgba(197,107,60,0.35)), transparent 55%), radial-gradient(120% 45% at 0% 100%, var(--amb-rail-2, rgba(90,132,101,0.30)), transparent 55%)",
            }}
          />
          {/* Hero and nav share one scroll container so the menu sits directly
              under the weather card instead of being pushed to the bottom. */}
          <div className="relative flex-1 min-h-0 overflow-y-auto">
            <Hero variant="rail" />

            <nav className="px-5 pb-5 pt-4">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => openTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`relative w-full rounded-xl pl-4 pr-3 py-3 mt-0.5 text-left transition-colors ${
                    active
                      ? "bg-white/10 text-sand-50"
                      : "text-sand-200/50 hover:bg-white/5 hover:text-sand-200/80"
                  }`}
                >
                  {/* A quiet marker reads more considered than a filled pill */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full transition-all ${
                      active ? "h-5 bg-clay-400" : "h-0 bg-transparent"
                    }`}
                  />
                  <span
                    className={`text-sm tracking-wide ${active ? "font-800" : "font-600"}`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
            </nav>
          </div>
        </aside>

        {/* Right pane: only this scrolls */}
        <LanguageProvider>
          <QuranPlayerProvider>
            <div id="tab-pane" className="flex-1 min-w-0 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 py-6">{panels}</div>
            </div>
            {overlays}
          </QuranPlayerProvider>
        </LanguageProvider>
      </main>
    );
  }

  return (
    <main className="min-h-screen paper-bg pb-28">
      <KeepAwake />
      <AmbientBackground />
      <AzaanManager />
      <Hero />

      <LanguageProvider>
        <QuranPlayerProvider>
          <div className="max-w-2xl mx-auto px-4 mt-5">{panels}</div>
          {overlays}
        </QuranPlayerProvider>
      </LanguageProvider>

      {/* Bottom tab bar — fridge/tablet friendly */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-sand-200">
        <div className="max-w-2xl mx-auto px-2 flex">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => openTab(t.id)}
                aria-current={active ? "page" : undefined}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 sm:py-3 transition-colors"
                title={t.label}
              >
                <span className={`text-lg sm:text-xl transition-transform ${active ? "scale-110" : "opacity-50"}`} aria-hidden="true">
                  {t.icon}
                </span>
                <span className={`hidden sm:block text-xs font-800 ${active ? "text-clay-600" : "text-ink-700/45"}`}>
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
