"use client";

import { useState } from "react";
import { BREAD_GUIDE } from "../lib/plan";

export default function BreadGuide() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-white rounded-3xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">🌾</span>
          <span>
            <span className="block font-display text-2xl font-600 text-ink-800 leading-tight">
              Bread &amp; carb guide
            </span>
            <span className="block text-sm text-ink-700/55 font-600">
              What every "bread" here means — no empty calories
            </span>
          </span>
        </span>
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="#A9552C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-6 pop-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-sage-500/10 border border-sage-500/25 p-4">
              <h3 className="font-800 text-sm text-sage-600 mb-2.5 flex items-center gap-1.5">
                <span aria-hidden="true">✓</span> Choose these
              </h3>
              <ul className="space-y-2">
                {BREAD_GUIDE.choose.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700/85 leading-snug flex gap-2">
                    <span className="text-sage-500 shrink-0" aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-clay-500/8 border border-clay-500/25 p-4">
              <h3 className="font-800 text-sm text-clay-600 mb-2.5 flex items-center gap-1.5">
                <span aria-hidden="true">✕</span> Skip / limit
              </h3>
              <ul className="space-y-2">
                {BREAD_GUIDE.skip.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700/85 leading-snug flex gap-2">
                    <span className="text-clay-500 shrink-0" aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-ink-700/70 leading-snug mt-4 bg-sand-50 rounded-2xl p-4 border border-sand-200">
            <span aria-hidden="true">💡 </span>{BREAD_GUIDE.note}
          </p>
        </div>
      )}
    </section>
  );
}
