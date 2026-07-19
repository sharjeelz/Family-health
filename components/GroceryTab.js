"use client";

import { useState, useEffect } from "react";

const KEY = "family-grocery-v1";

// Common household staples for one-tap adds (plain names — add the rest manually).
const STAPLES = [
  "Atta",
  "Rice",
  "Sugar",
  "Tea",
  "Cooking oil",
  "Ghee",
  "Milk",
  "Eggs",
  "Bread",
  "Yogurt",
  "Chicken",
  "Daal",
  "Onions",
  "Potatoes",
  "Tomatoes",
  "Salt",
  "Fruit",
  "Vegetables",
];

function load() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function GroceryTab() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  function persist(next) {
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function addText(value) {
    const t = value.trim();
    if (!t) return;
    // avoid duplicating an item that's already on the list (case-insensitive)
    if (items.some((it) => it.text.toLowerCase() === t.toLowerCase())) return;
    persist([{ id: Date.now(), text: t, done: false }, ...items]);
  }

  function add() {
    addText(text);
    setText("");
  }

  function toggle(id) {
    persist(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  }

  function remove(id) {
    persist(items.filter((it) => it.id !== id));
  }

  function clearDone() {
    persist(items.filter((it) => !it.done));
  }

  const active = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const onList = new Set(items.map((i) => i.text.toLowerCase()));

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-600 text-ink-800 mb-4">Grocery list</h2>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add an item…"
            className="flex-1 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-600 text-ink-800 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-400"
          />
          <button
            onClick={add}
            className="shrink-0 rounded-2xl bg-clay-500 text-white font-800 px-5 py-3 text-sm hover:bg-clay-600 active:scale-95 transition"
          >
            Add
          </button>
        </div>

        {/* Quick-add staples */}
        <p className="text-xs font-800 text-ink-700/40 uppercase tracking-wider mt-5 mb-2">
          Quick add — staples
        </p>
        <div className="flex flex-wrap gap-2">
          {STAPLES.map((s) => {
            const already = onList.has(s.toLowerCase());
            return (
              <button
                key={s}
                onClick={() => addText(s)}
                disabled={already}
                className={`rounded-full px-3 py-1.5 text-xs font-700 border transition active:scale-95 ${
                  already
                    ? "bg-sage-500/10 border-sage-500/30 text-sage-600 cursor-default"
                    : "bg-sand-50 border-sand-200 text-ink-700/80 hover:border-clay-400 hover:text-clay-600"
                }`}
              >
                {already ? "✓ " : "+ "}
                {s}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-800 text-ink-800">
            To buy {active.length > 0 && <span className="text-ink-700/40">({active.length})</span>}
          </h3>
          {done.length > 0 && (
            <button
              onClick={clearDone}
              className="text-xs font-700 text-ink-700/45 hover:text-clay-500 transition"
            >
              Clear bought
            </button>
          )}
        </div>

        {ready && items.length === 0 && (
          <p className="text-center text-ink-700/45 text-sm mt-4 py-4">
            List is empty. Add items above or tap a staple.
          </p>
        )}

        {active.length > 0 && (
          <ul className="mt-3 space-y-2">
            {active.map((it) => (
              <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-sand-50 border border-sand-200 px-4 py-3">
                <button
                  onClick={() => toggle(it.id)}
                  aria-label="Mark bought"
                  className="shrink-0 w-6 h-6 rounded-full border-2 border-sand-200 bg-white hover:border-sage-500 transition"
                />
                <span className="flex-1 text-sm font-700 text-ink-800">{it.text}</span>
                <button
                  onClick={() => remove(it.id)}
                  aria-label="Delete"
                  className="shrink-0 text-ink-700/30 hover:text-clay-500 transition text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <>
            <p className="text-xs font-800 text-ink-700/40 uppercase tracking-wider mt-6 mb-2">Bought</p>
            <ul className="space-y-2">
              {done.map((it) => (
                <li key={it.id} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 opacity-60">
                  <button
                    onClick={() => toggle(it.id)}
                    aria-label="Mark not bought"
                    className="shrink-0 w-6 h-6 rounded-full bg-sage-500 border-2 border-sage-500 flex items-center justify-center"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm font-600 text-ink-700/60 line-through">{it.text}</span>
                  <button
                    onClick={() => remove(it.id)}
                    aria-label="Delete"
                    className="shrink-0 text-ink-700/30 hover:text-clay-500 transition text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
