"use client";

import { useState, useEffect } from "react";
import { SYLLABUS } from "../lib/syllabusData";

function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function Syllabus() {
  const [childKey, setChildKey] = useState("zohaib");
  const [today, setToday] = useState(null);
  const [openWeek, setOpenWeek] = useState(null); // null = follow current; -1 = all closed

  useEffect(() => {
    const d = new Date();
    setToday(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }, []);

  const data = SYLLABUS[childKey];

  // Hide weeks that ended more than 2 weeks ago.
  let weeks = data.weeks;
  let currentWeek = null;
  if (today) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 14);
    weeks = data.weeks.filter((w) => !w.end || parseISO(w.end) >= cutoff);
    for (const w of weeks) {
      if (w.start && w.end && parseISO(w.start) <= today && today <= parseISO(w.end)) { currentWeek = w.week; break; }
    }
    if (currentWeek == null) {
      const up = weeks.find((w) => w.start && parseISO(w.start) > today);
      currentWeek = up ? up.week : weeks.length ? weeks[0].week : null;
    }
  }

  const effectiveOpen = openWeek == null ? currentWeek : openWeek;

  function badge(w) {
    if (!today || !w.start) return null;
    const s = parseISO(w.start), e = parseISO(w.end || w.start);
    if (s <= today && today <= e) return { t: "This week", c: "bg-sage-500 text-white" };
    const days = Math.round((s - today) / 86400000);
    if (days > 0) return { t: days === 1 ? "Tomorrow" : `in ${days} days`, c: w.week === currentWeek ? "bg-clay-500 text-white" : "bg-sand-100 text-ink-700/60" };
    return { t: "done", c: "bg-sand-100 text-ink-700/40" };
  }

  function pickChild(k) {
    setChildKey(k);
    setOpenWeek(null);
  }

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">📔</span>
        <h2 className="font-display text-2xl font-600 text-ink-800">Syllabus — what to prepare</h2>
      </div>
      <p className="text-sm text-ink-700/55 mb-4">Straight from the school syllabus. Past weeks are hidden.</p>

      {/* child toggle */}
      <div className="flex gap-2 mb-4">
        {Object.entries(SYLLABUS).map(([k, c]) => {
          const active = k === childKey;
          return (
            <button
              key={k}
              onClick={() => pickChild(k)}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-800 transition ${
                active ? "bg-sage-500 text-white border-sage-500" : "bg-sand-50 text-ink-700/70 border-sand-200 hover:border-sage-500/40"
              }`}
            >
              {c.label}
              <span className={`font-600 ${active ? "text-white/80" : "text-ink-700/45"}`}> · {c.grade}</span>
            </button>
          );
        })}
      </div>

      {/* weeks accordion */}
      {weeks.length === 0 ? (
        <p className="text-center text-ink-700/45 text-sm py-4">No upcoming weeks in the syllabus.</p>
      ) : (
        <div className="space-y-2">
          {weeks.map((w) => {
            const b = badge(w);
            const open = effectiveOpen === w.week;
            return (
              <div key={w.week} className="rounded-2xl border border-sand-200 overflow-hidden">
                <button
                  onClick={() => setOpenWeek(open ? -1 : w.week)}
                  aria-expanded={open}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors ${
                    open ? "bg-sage-500/10" : "bg-sand-50 hover:bg-sand-100"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-800 text-sm text-ink-800">Week {w.week}</span>
                    <span className="text-xs text-ink-700/55 font-600 truncate">{w.month} {w.dates}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {b && <span className={`text-[11px] font-800 px-2 py-0.5 rounded-full ${b.c}`}>{b.t}</span>}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="#A9552C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-1 space-y-3 pop-in">
                    {w.subjects.map((s) => (
                      <div key={s.name}>
                        <p className="font-800 text-xs uppercase tracking-wider text-clay-600 mb-1">{s.name}</p>
                        <ul className="space-y-0.5">
                          {s.lines.map((ln, i) => (
                            <li key={i} className="text-sm text-ink-700/80 leading-snug flex gap-1.5">
                              <span className="text-sage-500/60 shrink-0" aria-hidden="true">·</span>
                              <span>{ln.replace(/^[\s ]+/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RTL subjects (Urdu/Arabic/Quran) — open the real PDF page */}
      {data.pdfSubjects?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-sand-200">
          <p className="text-xs font-800 text-ink-700/45 uppercase tracking-wider mb-2">
            Urdu-script subjects — open the page
          </p>
          <div className="flex flex-wrap gap-2">
            {data.pdfSubjects.map((s) => (
              <a
                key={s.name}
                href={`${data.pdf}#page=${s.page}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-sand-50 border border-sand-200 px-3 py-1.5 text-xs font-800 text-ink-700/80 hover:border-clay-400 hover:text-clay-600 transition"
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
