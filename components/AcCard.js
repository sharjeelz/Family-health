"use client";

import { useState } from "react";
import { MODES, FAN_SPEEDS, pushUnit, clampTemp } from "../lib/acControl";

const MODE_LABELS = { cool: "Cool", dry: "Dry", fan: "Fan", heat: "Heat", auto: "Auto" };
const FAN_LABELS = { auto: "Auto", low: "Low", med: "Med", high: "High" };

// One air conditioner. The unit's own reported state drives everything —
// including its temperature range, which differs between makes.
export default function AcCard({ unit, onUpdated, onReload }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(unit.error || null);

  const min = unit.tempMin ?? 16;
  const max = unit.tempMax ?? 30;
  const off = !unit.power;
  const dead = Boolean(unit.error) || unit.online === false;

  // Apply optimistically so the tablet feels instant, then reconcile with what
  // the unit reports. A cloud unit takes about a second to answer.
  function update(patch) {
    if (dead) return;
    onUpdated({ ...unit, ...patch });
    setBusy(true);
    pushUnit(unit.id, patch)
      .then((fresh) => {
        setError(null);
        if (!fresh) return;
        onUpdated(fresh);
        // The cloud had not applied the change yet and we are showing what was
        // asked for; check back shortly for the real state.
        if (fresh.pending && onReload) setTimeout(onReload, 5000);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }

  return (
    <section className="bg-white rounded-3xl shadow-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em] truncate">
            {unit.label}
          </p>
          {unit.roomTemp != null && (
            <p className="text-ink-700/40 font-700 text-[0.65rem] mt-0.5">Room {unit.roomTemp}°</p>
          )}
        </div>
        <button
          onClick={() => update({ power: !unit.power })}
          disabled={dead || busy}
          aria-pressed={unit.power}
          className={`rounded-full px-4 py-1.5 font-800 text-xs tracking-wide transition-colors disabled:opacity-40 ${
            unit.power ? "bg-clay-500 text-white" : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
          }`}
        >
          {unit.power ? "ON" : "OFF"}
        </button>
      </div>

      {dead ? (
        <p className="text-clay-600 font-700 text-[0.7rem] leading-relaxed">
          {unit.error || "Unit is offline"}
        </p>
      ) : (
        <>
          {/* Target temperature */}
          <div className={`flex items-center justify-between gap-3 transition-opacity ${off ? "opacity-40" : ""}`}>
            <button
              onClick={() => update({ temp: clampTemp(unit.temp - 1, min, max) })}
              disabled={off || busy || unit.temp <= min}
              aria-label="Decrease temperature"
              className="w-12 h-12 shrink-0 rounded-2xl bg-sand-100 text-ink-800 text-2xl font-700 leading-none hover:bg-sand-200 active:scale-95 transition disabled:opacity-40"
            >
              −
            </button>
            <div className="text-center">
              <span className="font-display text-5xl font-700 text-ink-800 tabular-nums leading-none">
                {unit.temp}
              </span>
              <span className="font-display text-2xl font-700 text-ink-700/40 align-top">°C</span>
            </div>
            <button
              onClick={() => update({ temp: clampTemp(unit.temp + 1, min, max) })}
              disabled={off || busy || unit.temp >= max}
              aria-label="Increase temperature"
              className="w-12 h-12 shrink-0 rounded-2xl bg-sand-100 text-ink-800 text-2xl font-700 leading-none hover:bg-sand-200 active:scale-95 transition disabled:opacity-40"
            >
              +
            </button>
          </div>

          {/* Mode */}
          <div className={`grid grid-cols-5 gap-1 mt-4 transition-opacity ${off ? "opacity-40" : ""}`}>
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => update({ mode: m })}
                disabled={off || busy}
                aria-pressed={unit.mode === m}
                className={`rounded-xl py-2 font-800 text-[0.7rem] tracking-wide transition-colors ${
                  unit.mode === m ? "bg-ink-800 text-sand-50" : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Fan speed */}
          <div className={`grid grid-cols-4 gap-1 mt-2 transition-opacity ${off ? "opacity-40" : ""}`}>
            {FAN_SPEEDS.map((f) => (
              <button
                key={f}
                onClick={() => update({ fan: f })}
                disabled={off || busy}
                aria-pressed={unit.fan === f}
                className={`rounded-xl py-2 font-700 text-[0.7rem] tracking-wide transition-colors ${
                  unit.fan === f ? "bg-sage-500 text-white" : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
                }`}
              >
                {FAN_LABELS[f]}
              </button>
            ))}
          </div>
        </>
      )}

      {error && !dead && (
        <p className="text-clay-600 font-700 text-[0.65rem] mt-3">{error}</p>
      )}
    </section>
  );
}
