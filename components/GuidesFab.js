"use client";

import { useState } from "react";
import { useLang } from "../lib/i18n";
import BreadGuide from "./BreadGuide";
import MealTiming from "./MealTiming";
import HydrationGuide from "./HydrationGuide";

const TITLE = { en: "Guides", ur: "رہنمائی" };

// Floating button that opens a panel of reference guides (bread & carb guide
// today; built to hold more later). Global — available on every tab.
export default function GuidesFab() {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  const ur = lang === "ur";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={TITLE[lang] || "Guides"}
        className="fixed right-4 bottom-24 wall:bottom-4 z-30 w-14 h-14 rounded-full bg-clay-500 text-white shadow-card flex items-center justify-center hover:bg-clay-600 active:scale-95 transition"
      >
        {/* Book outline — the emoji it replaced did not read as deliberate */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5z" />
          <path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-900/60 backdrop-blur-sm sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            dir={ur ? "rtl" : "ltr"}
            onClick={(e) => e.stopPropagation()}
            className="pop-in w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-sand-50 rounded-t-3xl sm:rounded-3xl shadow-card"
          >
            <div className="sticky top-0 bg-sand-50/95 backdrop-blur-sm flex items-center justify-between px-5 py-4 border-b border-sand-200">
              <h2 className={`text-xl text-ink-800 ${ur ? "font-urdu" : "font-display font-600"}`}>
                {TITLE[lang]}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 text-ink-700/50 hover:text-clay-500 transition text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <MealTiming />
              <HydrationGuide />
              <BreadGuide />
              {/* Add more guide cards here as they're created. */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
