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

// --- SOS siren -------------------------------------------------------------
//
// A two-tone warble that runs in bursts rather than continuously: roughly
// 4 seconds on, 3 off, looping until stopped.
//
// The gaps are the point, not a stylistic choice. The agreed rule is that the
// siren stops when a parent phones home and says so — and a siren running flat
// out on the fridge is exactly what stops a child hearing that call. The gaps
// let the phone ring through and let them hear the voice on it.
//
// Built from oscillators like everything else here, so there is no MP3 to ship
// and nothing to fail to load at the one moment it matters.

const SIREN_ON = 4; // seconds of warble
const SIREN_OFF = 3; // seconds of quiet
const SIREN_SWEEP = 0.5; // how long each tone holds
const SIREN_LOW = 620;
const SIREN_HIGH = 940;
const SIREN_VOL = 0.3;

let siren = null;

export function startSiren() {
  const c = getCtx();
  if (!c || siren) return; // already wailing — never stack two
  if (c.state === "suspended") c.resume().catch(() => {});

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle"; // cuts through a noisy kitchen without being painful
  gain.gain.value = 0;
  osc.connect(gain).connect(c.destination);
  osc.start();

  const burst = (at) => {
    for (let i = 0; i * SIREN_SWEEP < SIREN_ON; i++) {
      osc.frequency.setValueAtTime(i % 2 ? SIREN_LOW : SIREN_HIGH, at + i * SIREN_SWEEP);
    }
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(SIREN_VOL, at + 0.05);
    gain.gain.setValueAtTime(SIREN_VOL, at + SIREN_ON - 0.05);
    gain.gain.linearRampToValueAtTime(0, at + SIREN_ON);
  };

  // Keep a couple of bursts queued ahead of the clock. Scheduling on the audio
  // clock rather than a timer means Android throttling the tab cannot make the
  // siren stutter or drift.
  const period = SIREN_ON + SIREN_OFF;
  let next = c.currentTime + 0.05;
  const pump = () => {
    while (next < c.currentTime + 2 * period) {
      burst(next);
      next += period;
    }
  };
  pump();
  siren = { osc, gain, iv: setInterval(pump, period * 500) };
}

export function stopSiren() {
  if (!siren) return;
  const { osc, gain, iv } = siren;
  siren = null;
  clearInterval(iv);
  const c = getCtx();
  if (!c) return;
  try {
    const t = c.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.1); // ramp, not a click
    osc.stop(t + 0.15);
  } catch {
    /* already stopped */
  }
}
