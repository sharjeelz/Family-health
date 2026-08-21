// Countdown to the next Islamic occasion, computed locally from the Umm al-Qura
// calendar (the same calendar the prayer times use). No network needed.
//
// Umm al-Qura is a calculated calendar, so these dates are predictable — but an
// actual moon sighting can still shift Ramadan or Eid by a day. Treat the
// countdown as "about right", not authoritative.

const EVENTS = [
  { month: 9, day: 1, name: "Ramadan", emoji: "🌙" },
  { month: 10, day: 1, name: "Eid al-Fitr", emoji: "🎉" },
  { month: 12, day: 9, name: "Day of Arafah", emoji: "🕋" },
  { month: 12, day: 10, name: "Eid al-Adha", emoji: "🐑" },
  { month: 1, day: 1, name: "Islamic New Year", emoji: "✨" },
];

const FMT = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

// Intl gives us the Hijri date for a Gregorian day; there is no direct inverse,
// so we walk forward a day at a time. Capped at ~13 months, which is always
// enough to reach the next occasion in the list.
function hijriParts(date) {
  const parts = FMT.formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}

export function nextHijriEvent(now = new Date()) {
  let best = null;
  try {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i <= 400; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const h = hijriParts(d);
      const hit = EVENTS.find((e) => e.month === h.month && e.day === h.day);
      if (hit) {
        best = { ...hit, daysAway: i, hijri: h };
        break;
      }
    }
  } catch {
    return null;
  }
  return best;
}

// A day count is meaningless at six months out, so switch to months until the
// event is inside the last month. Uses the lunar month (29.53 days) rather than
// a Gregorian one, since these are Hijri dates.
const LUNAR_MONTH = 29.53;

export function daysAwayLabel(days) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= LUNAR_MONTH) return `in ${days} days`;

  const months = Math.round(days / LUNAR_MONTH);
  if (months <= 1) return "in about a month";
  return `in about ${months} months`;
}
