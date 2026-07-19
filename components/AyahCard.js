"use client";

import { useState, useEffect } from "react";
import { ayahOfDay } from "../lib/ayat";

// Ayah of the day — a curated, meaningful verse chosen deterministically from
// today's date (same all day, gently rotating over time).
export default function AyahCard() {
  const [ayah, setAyah] = useState(null);

  useEffect(() => {
    setAyah(ayahOfDay(new Date()));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 to-ink-800 text-sand-50 rounded-3xl shadow-card p-6 sm:p-7">
      {/* soft ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, rgba(90,132,101,0.30), transparent 55%), radial-gradient(120% 90% at 0% 100%, rgba(197,107,60,0.22), transparent 55%)",
        }}
      />
      <div className="relative">
        <p className="text-sand-200/70 font-800 text-xs uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
          <span aria-hidden="true">✦</span> Ayah of the day
        </p>

        {ayah && (
          <>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic leading-[2] text-2xl sm:text-3xl text-sand-50"
            >
              {ayah.arabic}
            </p>
            <p
              dir="rtl"
              lang="ur"
              className="font-urdu text-sand-100/90 text-lg sm:text-xl mt-5 leading-[2.4]"
            >
              {ayah.urdu}
            </p>
            <p dir="rtl" lang="ur" className="font-urdu text-sage-400 font-500 text-sm mt-3">
              {ayah.ref}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
