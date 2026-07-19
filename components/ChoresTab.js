"use client";

import { useState, useEffect } from "react";
import { CHILDREN, CHORES } from "../lib/plan";
import Avatar from "./Avatar";

const KEY = "family-chores-v1";
const REWARD_KEY = "family-chore-rewards-v1";
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function load() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export default function ChoresTab() {
  const [store, setStore] = useState({});
  const [today, setToday] = useState(null);
  const [rewards, setRewards] = useState({});
  const [editReward, setEditReward] = useState(null);
  const [rGoal, setRGoal] = useState(20);
  const [rText, setRText] = useState("");

  useEffect(() => {
    setStore(load());
    setToday(new Date());
    try {
      setRewards(JSON.parse(window.localStorage.getItem(REWARD_KEY) || "{}"));
    } catch {}
  }, []);

  function getReward(id) {
    return rewards[id] || { goal: 20, text: "" };
  }
  function startEditReward(id) {
    const r = getReward(id);
    setRGoal(r.goal);
    setRText(r.text);
    setEditReward(id);
  }
  function saveReward(id) {
    const next = { ...rewards, [id]: { goal: Math.max(1, Number(rGoal) || 20), text: rText.trim() } };
    setRewards(next);
    try {
      window.localStorage.setItem(REWARD_KEY, JSON.stringify(next));
    } catch {}
    setEditReward(null);
  }

  if (!today) return <div className="text-center text-ink-700/40 font-600 py-10">Loading…</div>;

  const tk = dateKey(today);

  function done(childId, choreId, d = tk) {
    return !!store?.[d]?.[childId]?.[choreId];
  }

  function toggle(childId, choreId) {
    setStore((prev) => {
      const next = { ...prev };
      const day = { ...(next[tk] || {}) };
      const kid = { ...(day[childId] || {}) };
      kid[choreId] = !kid[choreId];
      day[childId] = kid;
      next[tk] = day;
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // stars for a child on a given date = number of completed chores that day
  function starsOn(childId, d) {
    const kid = store?.[d]?.[childId] || {};
    return CHORES.reduce((n, c) => n + (kid[c.id] ? 1 : 0), 0);
  }

  function weekStars(childId) {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const dd = new Date(today);
      dd.setDate(dd.getDate() - i);
      total += starsOn(childId, dateKey(dd));
    }
    return total;
  }

  // last 7 days (oldest → today) for the mini strip
  const week = Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(today);
    dd.setDate(dd.getDate() - (6 - i));
    return dd;
  });

  const leader = CHILDREN.reduce(
    (best, c) => {
      const s = weekStars(c.id);
      return s > best.s ? { id: c.id, s } : best;
    },
    { id: null, s: -1 }
  );

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" aria-hidden="true">⭐</span>
          <h2 className="font-display text-2xl font-600 text-ink-800">Chores &amp; stars</h2>
        </div>
        <p className="text-sm text-ink-700/55">Tick a chore to earn a star. Resets every day.</p>
      </section>

      {CHILDREN.map((child) => {
        const total = weekStars(child.id);
        const todayCount = starsOn(child.id, tk);
        const isLeader = leader.id === child.id && leader.s > 0;
        return (
          <section key={child.id} className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="flex items-center gap-2.5 min-w-0">
                <Avatar photo={child.photo} pos={child.pos} emoji={child.emoji} size={40} alt={child.name} />
                <span className="min-w-0">
                  <span className="block font-800 text-ink-800">{child.name}</span>
                  <span className="block text-xs text-ink-700/50 font-600">{todayCount}/{CHORES.length} today</span>
                </span>
                {isLeader && (
                  <span className="text-[11px] font-800 text-clay-600 bg-clay-400/15 px-2 py-0.5 rounded-full">🏆 top</span>
                )}
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-2xl font-700 text-clay-500 leading-none">⭐ {total}</span>
                <span className="block text-[10px] text-ink-700/50 font-700 mt-0.5">this week</span>
              </span>
            </div>

            {/* reward goal */}
            {editReward === child.id ? (
              <div className="rounded-2xl bg-sand-50 border border-sand-200 p-3 mb-4 space-y-2">
                <input
                  value={rText}
                  onChange={(e) => setRText(e.target.value)}
                  placeholder="Reward (e.g. ice cream, park trip)…"
                  className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-600 text-ink-800 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-400"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-700 text-ink-700/70">Stars needed</span>
                  <input
                    type="number"
                    min={1}
                    value={rGoal}
                    onChange={(e) => setRGoal(e.target.value)}
                    className="w-20 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-800 text-ink-800 focus:outline-none focus:border-clay-400"
                  />
                  <button onClick={() => saveReward(child.id)} className="ml-auto rounded-xl bg-clay-500 text-white font-800 px-4 py-2 text-sm hover:bg-clay-600 active:scale-95 transition">Save</button>
                  <button onClick={() => setEditReward(null)} className="rounded-xl bg-white border border-sand-200 text-ink-700/70 font-800 px-3 py-2 text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              (() => {
                const r = getReward(child.id);
                const pct = Math.min(total / r.goal, 1);
                const unlocked = total >= r.goal && r.text;
                return (
                  <div className={`rounded-2xl border p-3 mb-4 ${unlocked ? "bg-sage-500/10 border-sage-500/30" : "bg-sand-50 border-sand-200"}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-800 text-ink-800 min-w-0 truncate">
                        🎁 {r.text ? r.text : <span className="text-ink-700/45 font-700">Set a reward</span>}
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-800 text-clay-600">{total}/{r.goal} ⭐</span>
                        <button onClick={() => startEditReward(child.id)} aria-label="Edit reward" className="text-ink-700/30 hover:text-clay-500 text-base leading-none">✎</button>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-sand-200 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${unlocked ? "bg-sage-500" : "bg-clay-400"}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                    {unlocked && <p className="text-xs font-800 text-sage-600 mt-1.5">🎉 Reward unlocked — great job!</p>}
                  </div>
                );
              })()
            )}

            {/* today's chores */}
            <div className="grid grid-cols-1 gap-2">
              {CHORES.map((c) => {
                const on = done(child.id, c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(child.id, c.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-3 rounded-2xl p-3 border text-left transition-colors ${
                      on ? "bg-clay-400/10 border-clay-400/30" : "bg-sand-50 border-sand-200 hover:border-clay-400/40"
                    }`}
                  >
                    <span className="text-lg shrink-0" aria-hidden="true">{c.icon}</span>
                    <span className={`flex-1 text-sm font-700 ${on ? "text-clay-600" : "text-ink-800"}`}>{c.label}</span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                        on ? "bg-clay-500 border-clay-500 check-bounce" : "bg-white border-sand-200"
                      }`}
                    >
                      {on && <span className="text-white text-sm" aria-hidden="true">★</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 7-day star strip */}
            <div className="flex items-end justify-between gap-2 mt-4">
              {week.map((d, i) => {
                const s = starsOn(child.id, dateKey(d));
                const pct = s / CHORES.length;
                const isToday = dateKey(d) === tk;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-16 rounded-lg bg-sand-100 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${pct >= 1 ? "bg-clay-500" : pct > 0 ? "bg-clay-400" : "bg-transparent"}`}
                        style={{ height: `${Math.max(pct * 100, pct > 0 ? 14 : 0)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-800 ${isToday ? "text-clay-600" : "text-ink-700/45"}`}>{DAYS[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
