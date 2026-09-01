"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUnits } from "../lib/acControl";
import AcCard from "./AcCard";

// Loads whatever air conditioners are configured and renders one card each.
// The Gree answers on the LAN in milliseconds; the Hisense goes through a
// cloud service and takes about a second, so units arrive together but each
// carries its own error rather than one failure blanking the panel.
// The silhouette of an AC card: label, power pill, the big temperature, then
// the two button rows.
function AcSkeleton() {
  return (
    <section className="bg-white rounded-3xl shadow-card p-5" aria-hidden="true">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="shimmer block h-3 w-24 rounded-full" />
        <span className="shimmer block h-7 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="shimmer block w-12 h-12 rounded-2xl" />
        <span className="shimmer block h-10 w-24 rounded-xl" />
        <span className="shimmer block w-12 h-12 rounded-2xl" />
      </div>
      <div className="grid grid-cols-5 gap-1 mt-4">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="shimmer block h-8 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 mt-2">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="shimmer block h-8 rounded-xl" />
        ))}
      </div>
      <span className="sr-only">Loading air conditioners</span>
    </section>
  );
}

export default function AcPanel() {
  const [units, setUnits] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    fetchUnits()
      .then((next) => {
        setError(null);
        setUnits(next);
      })
      .catch((e) => {
        setError(e.message);
        // Keep the cards on screen and mark them offline rather than replacing
        // them with a line of text. The room still has an air conditioner when
        // the dashboard cannot reach it, and a card that says so — with its
        // buttons disabled — reads better than the panel vanishing.
        setUnits((prev) =>
          prev ? prev.map((u) => ({ ...u, online: false, error: e.message })) : prev,
        );
      });
  }, []);

  // Refresh periodically: the units are also driven by their own remotes and
  // phone apps, so without this a card can sit wrong for hours. Also refresh
  // when the tablet comes back to the foreground.
  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Replace one unit in place after a button press.
  const onUpdated = useCallback((unit) => {
    setUnits((prev) => (prev || []).map((u) => (u.id === unit.id ? { ...u, ...unit } : u)));
  }, []);

  // Only when nothing has ever loaded is there nothing to show — no units are
  // known yet, so there are no cards to disable. Once any have arrived, the
  // failure is handled above by marking them offline.
  if (error && !units) {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5">
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-2">
          Air conditioning
        </p>
        <p className="text-clay-600 font-700 text-xs">{error}</p>
      </section>
    );
  }

  // The Gree answers on the LAN in milliseconds, but the Hisense goes through
  // a cloud service and takes about a second. Show the card's shape while we
  // wait rather than an empty gap that reads as a broken layout.
  if (!units) return <AcSkeleton />;

  return (
    <>
      {units.map((u) => (
        <AcCard key={u.id} unit={u} onUpdated={onUpdated} onReload={load} />
      ))}
    </>
  );
}
