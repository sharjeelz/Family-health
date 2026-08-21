"use client";

import { useState, useEffect } from "react";
import {
  MODES,
  FAN_SPEEDS,
  TEMP_MIN,
  TEMP_MAX,
  DEFAULT_STATE,
  isConnected,
  fetchState,
  pushState,
  clampTemp,
} from "../lib/acControl";

const MODE_LABELS = { cool: "Cool", dry: "Dry", fan: "Fan", heat: "Heat", auto: "Auto" };
const FAN_LABELS = { auto: "Auto", low: "Low", med: "Med", high: "High" };

// Air-conditioner control. Until a LAN helper is configured in lib/acControl.js
// this runs as a local preview: the controls respond so the layout can be
// judged, but nothing is sent anywhere.
export default function AcCard() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [error, setError] = useState(null);
  const connected = isConnected();

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    fetchState()
      .then((s) => {
        if (!cancelled && s) setState((prev) => ({ ...prev, ...s }));
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [connected]);

  // Apply locally first so the tablet feels instant, then reconcile.
  function update(patch) {
    setState((prev) => ({ ...prev, ...patch }));
    if (!connected) return;
    pushState(patch)
      .then((s) => s && setState((prev) => ({ ...prev, ...s })))
      .catch((e) => setError(e.message));
  }

  const off = !state.power;

  return (
    <section className="bg-white rounded-3xl shadow-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-ink-700/45 font-800 text-[0.65rem] uppercase tracking-[0.18em]">
          Air conditioner
        </p>
        <button
          onClick={() => update({ power: !state.power })}
          aria-pressed={state.power}
          className={`rounded-full px-4 py-1.5 font-800 text-xs tracking-wide transition-colors ${
            state.power
              ? "bg-clay-500 text-white"
              : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
          }`}
        >
          {state.power ? "ON" : "OFF"}
        </button>
      </div>

      {/* Target temperature */}
      <div className={`flex items-center justify-between gap-3 transition-opacity ${off ? "opacity-40" : ""}`}>
        <button
          onClick={() => update({ temp: clampTemp(state.temp - 1) })}
          disabled={off || state.temp <= TEMP_MIN}
          aria-label="Decrease temperature"
          className="w-12 h-12 shrink-0 rounded-2xl bg-sand-100 text-ink-800 text-2xl font-700 leading-none hover:bg-sand-200 active:scale-95 transition disabled:opacity-40"
        >
          −
        </button>
        <div className="text-center">
          <span className="font-display text-5xl font-700 text-ink-800 tabular-nums leading-none">
            {state.temp}
          </span>
          <span className="font-display text-2xl font-700 text-ink-700/40 align-top">°C</span>
        </div>
        <button
          onClick={() => update({ temp: clampTemp(state.temp + 1) })}
          disabled={off || state.temp >= TEMP_MAX}
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
            disabled={off}
            aria-pressed={state.mode === m}
            className={`rounded-xl py-2 font-800 text-[0.7rem] tracking-wide transition-colors ${
              state.mode === m
                ? "bg-ink-800 text-sand-50"
                : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
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
            disabled={off}
            aria-pressed={state.fan === f}
            className={`rounded-xl py-2 font-700 text-[0.7rem] tracking-wide transition-colors ${
              state.fan === f
                ? "bg-sage-500 text-white"
                : "bg-sand-100 text-ink-700/50 hover:bg-sand-200"
            }`}
          >
            {FAN_LABELS[f]}
          </button>
        ))}
      </div>

      {!connected && (
        <p className="text-ink-700/40 font-700 text-[0.65rem] mt-3 leading-relaxed">
          Preview — no local helper configured yet. See lib/acControl.js.
        </p>
      )}
      {error && (
        <p className="text-clay-600 font-700 text-[0.65rem] mt-3">Helper error: {error}</p>
      )}
    </section>
  );
}
