"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "family-health-tracker-v1";

function loadAll() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — fail quietly, app still works in-session
  }
}

// A day record: { meals: {slotId: bool}, habits: {habitId: bool}, water: {personId: n} }
function emptyDay() {
  return { meals: {}, habits: {}, water: {} };
}

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useTracker(activeDate) {
  const key = dateKey(activeDate);
  const [store, setStore] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(loadAll());
    setReady(true);
  }, []);

  const day = store[key] || emptyDay();

  const update = useCallback(
    (mutator) => {
      setStore((prev) => {
        const current = prev[key] || emptyDay();
        const nextDay = mutator({
          meals: { ...current.meals },
          habits: { ...current.habits },
          water: { ...current.water },
        });
        const next = { ...prev, [key]: nextDay };
        saveAll(next);
        return next;
      });
    },
    [key]
  );

  const toggleMeal = useCallback(
    (slotId) => update((d) => ({ ...d, meals: { ...d.meals, [slotId]: !d.meals[slotId] } })),
    [update]
  );

  const toggleHabit = useCallback(
    (habitId) => update((d) => ({ ...d, habits: { ...d.habits, [habitId]: !d.habits[habitId] } })),
    [update]
  );

  const setWater = useCallback(
    (personId, n) =>
      update((d) => ({ ...d, water: { ...d.water, [personId]: Math.max(0, n) } })),
    [update]
  );

  // 7-day streak / history for the mini progress view
  const history = useCallback(
    (days = 7) => {
      const out = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(activeDate);
        d.setDate(d.getDate() - i);
        const rec = store[dateKey(d)] || emptyDay();
        const habitCount = Object.values(rec.habits).filter(Boolean).length;
        out.push({
          date: d,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          habitCount,
        });
      }
      return out;
    },
    [store, activeDate]
  );

  return { ready, day, toggleMeal, toggleHabit, setWater, history };
}
