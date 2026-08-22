"use client";

import { useEffect, useState } from "react";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Rows come back as "YYYY-MM-DD" strings (dateStrings in lib/db.js), so format
// them by hand rather than through Date — no timezone shifting on the tablet.
function fmt(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${MON[Number(m) - 1]} ${Number(d)}, ${y}`;
}

const CAT = {
  exam: "text-clay-600 bg-clay-400/15",
  holiday: "text-sage-600 bg-sage-500/12",
  ptm: "text-date-500 bg-clay-400/12",
  term: "text-sage-600 bg-sage-500/12",
  event: "text-ink-700/60 bg-sand-100",
};

export default function SchoolCalendarTable({ limit = 50 }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetch(`/api/school-calendar?limit=${limit}`)
      .then((r) => r.json())
      .then((d) => alive && setState(d.ok ? { status: "ready", events: d.events } : { status: "error", error: d.error }))
      .catch((e) => alive && setState({ status: "error", error: e.message }));
    return () => {
      alive = false;
    };
  }, [limit]);

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-2xl font-600 text-ink-800">School calendar</h2>
        {state.status === "ready" && (
          <span className="text-xs font-700 text-sage-600 bg-sage-500/12 px-3 py-1 rounded-full">
            {state.events.length} from MySQL
          </span>
        )}
      </div>
      <p className="text-sm text-ink-700/55 mb-4">Live from the family database.</p>

      {state.status === "loading" && (
        <p className="text-center text-ink-700/45 text-sm py-6">Loading…</p>
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center">
          <p className="text-sm font-700 text-ink-800">Database unreachable</p>
          <p className="text-sm text-ink-700/55 mt-1">{state.error}</p>
        </div>
      )}

      {state.status === "ready" && (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-ink-700/45 font-800">
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3 whitespace-nowrap">Starts</th>
                <th className="py-2 pr-3 whitespace-nowrap">Ends</th>
                <th className="py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {state.events.map((e) => (
                <tr key={e.id} className="border-t border-sand-200 align-top">
                  <td className="py-2.5 pr-3 text-sm font-700 text-ink-800 leading-snug">{e.title}</td>
                  <td className="py-2.5 pr-3 text-xs font-600 text-ink-700/60 whitespace-nowrap">
                    {fmt(e.start_date)}
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-600 text-ink-700/45 whitespace-nowrap">
                    {e.end_date ? fmt(e.end_date) : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-[11px] font-800 px-2.5 py-1 rounded-full ${CAT[e.category] || CAT.event}`}
                    >
                      {e.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
