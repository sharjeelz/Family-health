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
        className="fixed right-4 bottom-24 z-30 w-14 h-14 rounded-full bg-clay-500 text-white shadow-card flex items-center justify-center text-2xl hover:bg-clay-600 active:scale-95 transition"
      >
        <span aria-hidden="true">📖</span>
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
              <h2 className={`text-xl text-ink-800 flex items-center gap-2 ${ur ? "font-urdu" : "font-display font-600"}`}>
                <span aria-hidden="true">📖</span> {TITLE[lang]}
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
