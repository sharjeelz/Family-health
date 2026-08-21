"use client";

import { DUAS } from "../lib/duas";

// The going-out and coming-in duas, side by side. Arabic in the Quranic face
// and Urdu in Nastaliq, matching the ayah card. Rendered as a fragment so the
// two sit as siblings in the dashboard grid.
//
// duas.js still carries transliteration and English for each entry; they are
// simply not shown.
export default function DuaCards() {
  return (
    <>
      {DUAS.map((d) => (
        <section key={d.id} className="bg-white rounded-3xl shadow-card p-5 flex flex-col">
          <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-3">
            {d.title}
          </p>

          <p
            dir="rtl"
            lang="ar"
            className="font-quran text-ink-800 text-2xl leading-[2.4]"
          >
            {d.arabic}
          </p>

          <p
            dir="rtl"
            lang="ur"
            className="font-urdu text-ink-700/75 text-base mt-4 leading-[2.2]"
          >
            {d.urdu}
          </p>

          <p dir="rtl" lang="ur" className="font-urdu text-sage-600 font-500 text-xs mt-auto pt-3">
            {d.ref}
          </p>
        </section>
      ))}
    </>
  );
}
