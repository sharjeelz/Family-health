"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUnits } from "../lib/acControl";
import AcCard from "./AcCard";

// Loads whatever air conditioners are configured and renders one card each.
// The Gree answers on the LAN in milliseconds; the Hisense goes through a
// cloud service and takes about a second, so units arrive together but each
// carries its own error rather than one failure blanking the panel.
export default function AcPanel() {
  const [units, setUnits] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    fetchUnits()
      .then(setUnits)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  // Replace one unit in place after a button press.
  const onUpdated = useCallback((unit) => {
    setUnits((prev) => (prev || []).map((u) => (u.id === unit.id ? { ...u, ...unit } : u)));
  }, []);

  if (error) {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5">
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] mb-2">
          Air conditioning
        </p>
        <p className="text-clay-600 font-700 text-xs">{error}</p>
      </section>
    );
  }

  if (!units) return null;

  return (
    <>
      {units.map((u) => (
        <AcCard key={u.id} unit={u} onUpdated={onUpdated} />
      ))}
    </>
  );
}
