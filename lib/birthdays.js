// Family birthdays. `date` is MM-DD — the year is deliberately left out: the
// dashboard shows who is next, not how old anyone is.
//
// `photo` is optional and points at a file in public/ (the children already
// have one). `where` is shown for people who are not in the house, so the
// card reads as "remember to call" rather than "remember to bake a cake".
export const BIRTHDAYS = [
  { name: "Zohaib", date: "03-14", photo: "/zohaib_2.jpg", pos: "50% 12%" },
  { name: "Zainab", date: "12-19", photo: "/zainab_2.jpg", pos: "50% 20%" },
  { name: "Sharjeel", date: "10-17" ,photo: "/sharjeel.jpg", pos: "50% 20%"},
  { name: "Hifza", date: "12-25",photo: "/hifza.jpg", pos: "50% 20%"},
  { name: "Raheel", date: "06-19", photo: "/raheel.jpg", pos: "50% 20%" },
  { name: "Bubbly", date: "02-03", photo: "/khadija.jpg", pos: "50% 20%" },
];

// Wedding anniversaries. Same shape as BIRTHDAYS — `date` is MM-DD, `photo`
// and `where` are optional. `names` reads better than `name` for a couple, but
// either works: the card shows whichever is set.
export const ANNIVERSARY = [
  { name: "Sharjeel & Hifza", date: "06-30", photo: "/hifza_kids.jpg", pos: "50% 20%" },
  { name: "Raheel & Bubbly", date: "10-29",photo: "/raheel_bubbly.jpg", pos: "50% 20%" },
];

const DAY = 86400000;

// Days until the next occurrence, counting today as 0. Rolls into next year
// once the date has passed.
export function daysUntil(mmdd, from = new Date()) {
  const [m, d] = mmdd.split("-").map(Number);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  // Round rather than floor: a DST shift would otherwise land on 0.96 of a day
  // and read as "today" a day early.
  return Math.round((next - today) / DAY);
}

// Soonest first. Shared by both lists so they behave identically.
function upcoming(list, from) {
  return list
    .map((p) => ({ ...p, daysAway: daysUntil(p.date, from) }))
    .sort((a, b) => a.daysAway - b.daysAway);
}

export function upcomingBirthdays(from = new Date()) {
  return upcoming(BIRTHDAYS, from);
}

export function upcomingAnniversaries(from = new Date()) {
  return upcoming(ANNIVERSARY, from);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(mmdd) {
  const [m, d] = mmdd.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export function daysAwayLabel(days) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 30) return `in ${days} days`;
  const months = Math.round(days / 30.44);
  return months <= 1 ? "in about a month" : `in about ${months} months`;
}
