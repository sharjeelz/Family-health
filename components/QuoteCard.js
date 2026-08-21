"use client";

import { useState, useEffect } from "react";
import { quoteOfDay } from "../lib/quotes";

// The daily Urdu message. It used to live in the hero rail; it now sits beside
// the ayah of the day on the Home tab as its own compact card.
export default function QuoteCard() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    setQuote(quoteOfDay(new Date()));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 text-sand-50 rounded-3xl shadow-card p-5">
      {/* soft ambient glow — sage-forward, so it reads as a sibling of the
          ayah card rather than a copy of it */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, rgba(90,132,101,0.32), transparent 55%), radial-gradient(120% 90% at 100% 100%, rgba(197,107,60,0.18), transparent 55%)",
        }}
      />
      <div className="relative">
        <p className="text-sand-200/70 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
          <span aria-hidden="true">❝</span> Today&apos;s message
        </p>

        {quote && (
          <>
            <p
              dir="rtl"
              lang="ur"
              className="font-urdu text-sand-100/90 text-base leading-[2.2] whitespace-pre-line"
            >
              {quote.text}
            </p>
            {quote.author && (
              <p dir="rtl" lang="ur" className="font-urdu text-sage-400 font-500 text-xs mt-3">
                — {quote.author}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
