"use client";

import { useState, useEffect } from "react";
import { ayahOfDay } from "../lib/ayat";
import { quoteOfDay } from "../lib/quotes";
import CardMotif from "./CardMotif";

// The ayah of the day and the daily Urdu message, side by side in one card at
// the top of Home. They were two dark cards at the bottom; both are read at a
// glance rather than studied, so they earn a place up top but not the visual
// weight — hence the ordinary white card and the smaller type.
export default function DailyWordCard() {
  const [ayah, setAyah] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const now = new Date();
    setAyah(ayahOfDay(now));
    setQuote(quoteOfDay(now));
  }, []);

  return (
    <section className="relative overflow-hidden isolate bg-white rounded-3xl shadow-card p-5">
      <CardMotif kind="islamic" />

      {/* Side by side once there is room; stacked on a narrow screen, with a
          rule between them so the two are never read as one passage. */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 sm:divide-x sm:divide-sand-200">
        <div className="min-w-0">
          <p className="text-ink-700/40 font-800 text-[0.6rem] uppercase tracking-[0.18em] mb-2">
            Ayah of the day
          </p>
          {ayah && (
            <>
              <p dir="rtl" lang="ar" className="font-quran leading-[2.1] text-lg text-ink-800">
                {ayah.arabic}
              </p>
              <p dir="rtl" lang="ur" className="font-urdu text-ink-700/75 text-[0.8rem] mt-2 leading-[2]">
                {ayah.urdu}
              </p>
              <p dir="rtl" lang="ur" className="font-urdu text-sage-600 font-500 text-[0.65rem] mt-1.5">
                {ayah.ref}
              </p>
            </>
          )}
        </div>

        <div className="min-w-0 border-t border-sand-200 pt-4 sm:border-t-0 sm:pt-0 sm:pl-6">
          <p className="text-ink-700/40 font-800 text-[0.6rem] uppercase tracking-[0.18em] mb-2">
            Today&apos;s message
          </p>
          {quote && (
            <>
              <p
                dir="rtl"
                lang="ur"
                className="font-urdu text-ink-700/75 text-[0.8rem] leading-[2] whitespace-pre-line"
              >
                {quote.text}
              </p>
              {quote.author && (
                <p dir="rtl" lang="ur" className="font-urdu text-sage-600 font-500 text-[0.65rem] mt-1.5">
                  — {quote.author}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
