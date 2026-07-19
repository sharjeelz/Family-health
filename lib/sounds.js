// Reminder sound presets — from a light ping to an urgent, repeating alert.
// `cycles`/`gap` control intensity (how insistent it is).
export const REMINDER_SOUNDS = [
  { id: "chime", label: "Chime", emoji: "🎐", notes: [880, 1174.66], vol: 0.16, cycles: 1 },
  { id: "light", label: "Light ping", emoji: "🍃", notes: [1174.66], vol: 0.12, cycles: 1, dur: 0.3 },
  { id: "bell", label: "Bell", emoji: "🔔", notes: [659.25, 880, 659.25], vol: 0.18, cycles: 1 },
  { id: "medicine", label: "Medicine (urgent)", emoji: "💊", notes: [988, 988, 988], vol: 0.26, cycles: 3, gap: 0.45, step: 0.16 },
  { id: "alarm", label: "Alarm (strong)", emoji: "🚨", notes: [880, 660, 880, 660], vol: 0.28, cycles: 3, gap: 0.35 },
];

export const soundById = (id) => REMINDER_SOUNDS.find((s) => s.id === id) || REMINDER_SOUNDS[0];
