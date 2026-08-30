"use client";

import { useState, useEffect } from "react";
import { CHILDREN } from "../lib/plan";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function when(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

// Photographs from school events, sent to the family group and filed here.
export default function Memories() {
  const [state, setState] = useState({ status: "loading" });
  const [who, setWho] = useState("all");
  const [open, setOpen] = useState(null); // a photo shown full screen

  useEffect(() => {
    let alive = true;
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.ok) setState({ status: "ready", memories: d.memories });
        else setState({ status: "error", error: d.error });
      })
      .catch((e) => alive && setState({ status: "error", error: e.message }));
    return () => {
      alive = false;
    };
  }, []);

  const all = state.memories || [];
  // A photo with no child named belongs to both, so it shows under either.
  const shown = who === "all" ? all : all.filter((m) => !m.child_id || m.child_id === who);

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <h2 className="font-display text-2xl font-600 text-ink-800 mb-1">Memories</h2>
      <p className="text-sm text-ink-700/55 mb-4">
        Send a photo to the family group with a caption — it lands here.
      </p>

      <div className="flex gap-1 bg-sand-200 rounded-2xl p-1 border border-sand-200 mb-4">
        {[["all", "Both"], ...CHILDREN.map((c) => [c.id, c.name])].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setWho(id)}
            aria-current={who === id ? "page" : undefined}
            className={`flex-1 rounded-xl px-3 py-2 font-800 text-sm transition ${
              who === id
                ? "bg-white text-ink-800 shadow-card"
                : "text-ink-700/70 hover:bg-white/50 hover:text-ink-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {state.status === "loading" && (
        <p className="text-center text-ink-700/45 text-sm py-6">Loading…</p>
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center">
          <p className="text-sm font-700 text-ink-800">Can't reach the memories</p>
          <p className="text-sm text-ink-700/55 mt-1">{state.error}</p>
        </div>
      )}

      {state.status === "ready" && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-6 text-center">
          <p className="text-sm font-700 text-ink-800">Nothing here yet</p>
          <p className="text-sm text-ink-700/55 mt-1 leading-snug">
            Send a photo to the family group with a caption like
            <br />
            <span className="font-700">“Zohaib sports day”</span>
          </p>
        </div>
      )}

      {state.status === "ready" && shown.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {shown.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setOpen(m)}
                className="w-full text-left rounded-2xl overflow-hidden bg-sand-50 border border-sand-200 hover:border-clay-400 active:scale-[0.99] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/memories/${m.id}`}
                  alt={m.title}
                  loading="lazy"
                  className="w-full h-28 object-cover"
                />
                <div className="p-2.5">
                  <p className="font-800 text-xs text-ink-800 leading-snug truncate">{m.title}</p>
                  <p className="text-[11px] text-ink-700/50 font-600 mt-0.5">{when(m.taken_at)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/memories/${open.id}`}
            alt={open.title}
            className="max-w-full max-h-[80vh] rounded-2xl object-contain"
          />
          <p className="text-sand-50 font-800 mt-4">{open.title}</p>
          <p className="text-sand-200/60 font-600 text-sm">{when(open.taken_at)}</p>
        </div>
      )}
    </section>
  );
}
