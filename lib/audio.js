"use client";

// Shared audio engine for short chimes (water reminder, azaan fallback).
// One AudioContext for the whole app; it must be "armed" (resumed) by a user
// gesture once per session before it can make sound — browser autoplay policy.

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function armAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

export function playChime(notes = [880, 1174.66], vol = 0.16) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const start = c.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.42);
  });
}

// Play a sound preset ({ notes, vol, cycles, gap, step, dur }) — repeats the
// note sequence `cycles` times to make it more or less insistent.
export function playSound(spec = {}) {
  const { notes = [880], vol = 0.16, cycles = 1, gap = 0.35, step = 0.18, dur = 0.4 } = spec;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  let t0 = c.currentTime + 0.05; // small lead so a just-resumed context stays in time
  for (let cy = 0; cy < cycles; cy++) {
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const start = t0 + i * step;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
    t0 += notes.length * step + gap;
  }
}

// Arm audio on the first user gesture. Returns a cleanup function.
export function installAudioArmer() {
  if (typeof window === "undefined") return () => {};
  const evts = ["pointerdown", "touchstart", "keydown", "click"];
  const onFirst = () => {
    armAudio();
    evts.forEach((e) => window.removeEventListener(e, onFirst));
  };
  evts.forEach((e) => window.addEventListener(e, onFirst, { once: true, passive: true }));
  return () => evts.forEach((e) => window.removeEventListener(e, onFirst));
}
