"use client";

import { useState, useEffect } from "react";
import { upcomingBirthdays, upcomingAnniversaries, formatDate, daysAwayLabel } from "../lib/birthdays";
import Avatar from "./Avatar";
import CardMotif from "./CardMotif";

// What the family should not forget. Relatives abroad are the real point of
// this — a date that passes unnoticed is a phone call not made — so anyone
// with a `where` is marked, and the nearest one is given the prominence.
//
// Birthdays and anniversaries are separate lists behind one card: they are
// glanced at, not browsed, so showing both at once would just halve the space
// each gets.
export default function BirthdaysCard() {
  const [lists, setLists] = useState(null);
  const [tab, setTab] = useState("birthdays");

  useEffect(() => {
    const read = () => ({
      birthdays: upcomingBirthdays(new Date()),
      anniversaries: upcomingAnniversaries(new Date()),
    });
    setLists(read());
    // Roll over past midnight on a screen that is never reloaded.
    const t = setInterval(() => setLists(read()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Nothing configured yet — stay out of the way rather than showing an empty
  // card on the family's dashboard.
  if (!lists || (lists.birthdays.length === 0 && lists.anniversaries.length === 0)) return null;

  const hasAnniversaries = lists.anniversaries.length > 0;
  const people = tab === "anniversaries" ? lists.anniversaries : lists.birthdays;
  if (people.length === 0) return null;

  const [next, ...rest] = people;
  const isToday = next.daysAway === 0;

  return (
    <section className="relative overflow-hidden isolate bg-white rounded-3xl shadow-card p-5">
      <CardMotif kind="birthday" />
      {/* The date sits in the header rather than trailing the countdown: it is
          the thing you actually need to remember, and down there the balloons
          were crowding it. */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {hasAnniversaries ? (
          <div className="flex gap-1">
            {[
              { id: "birthdays", label: "Birthdays" },
              { id: "anniversaries", label: "Anniversaries" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`font-800 text-[0.6rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full transition-colors ${
                  tab === t.id
                    ? "bg-ink-800 text-sand-50"
                    : "text-ink-700/40 hover:bg-sand-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em]">
            Birthdays
          </p>
        )}
        <span
          className={`font-800 text-xs px-3 py-1 rounded-full shrink-0 ${
            isToday ? "bg-sage-500 text-white" : "bg-clay-500 text-white"
          }`}
        >
          {formatDate(next.date)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Avatar photo={next.photo} pos={next.pos} alt={next.name} size={44} />
        <div className="min-w-0">
          <p className="font-display text-xl font-700 text-ink-800 truncate">{next.name}</p>
          <p className={`text-sm font-800 mt-0.5 ${isToday ? "text-sage-600" : "text-clay-600"}`}>
            {isToday
              ? tab === "anniversaries"
                ? "Anniversary today"
                : "Birthday today"
              : daysAwayLabel(next.daysAway)}
          </p>
          {next.where && (
            <p className="text-ink-700/45 font-700 text-xs mt-0.5">{next.where} — give them a call</p>
          )}
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-sand-200 space-y-1.5">
          {rest.slice(0, 5).map((p) => (
            <li key={p.name} className="flex items-baseline justify-between gap-3">
              <span className="text-ink-800 font-700 text-sm truncate">
                {p.name}
                {p.where && <span className="text-ink-700/35 font-600"> · {p.where}</span>}
              </span>
              <span className="text-ink-700/45 font-700 text-xs shrink-0">
                {formatDate(p.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
