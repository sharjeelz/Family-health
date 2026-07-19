// School calendar — scraped from public/calendar-2026.pdf
// (Pakistan International School, Riyadh — Academic Session 2026-2027).
// `date` is the ISO start; `end` (optional) marks multi-day events.

export const SCHOOL_EVENTS = [
  { date: "2026-05-05", title: "New Academic Session Begins (PG–IX)" },
  { date: "2026-05-10", title: "Classes start — X" },
  { date: "2026-05-10", end: "2026-05-14", title: "Provisional Admissions of XI" },
  { date: "2026-05-14", title: "Award Ceremony (I–VIII)" },
  { date: "2026-05-17", title: "Provisional Classes start — XI" },
  { date: "2026-05-23", title: "Meena Bazaar (Ladies)" },
  { date: "2026-05-24", end: "2026-06-01", title: "Hajj Holidays" },
  { date: "2026-06-02", title: "School Re-opens" },
  { date: "2026-06-18", title: "Art & Clay Modelling Competition (PG–IV)" },
  { date: "2026-06-19", title: "PTM I (4–6 pm)" },
  { date: "2026-06-23", title: "Summer Home Work distributed" },
  { date: "2026-06-25", end: "2026-08-19", title: "Summer Vacation 2026" },
  { date: "2026-08-20", title: "Teachers return to school" },
  { date: "2026-08-23", title: "School Re-opens · Classes XII start" },
  { date: "2026-09-06", title: "Defence Day (Assembly Program)" },
  { date: "2026-09-17", title: "Annual Qira'at Competition" },
  { date: "2026-09-22", title: "Student Council Election" },
  { date: "2026-09-23", title: "Saudi National Day (Holiday)" },
  { date: "2026-10-23", title: "PTM II (4–6 pm)" },
  { date: "2026-11-01", end: "2026-11-22", title: "Mid-Term Examination (PG–XII)" },
  { date: "2026-11-09", title: "Allama Iqbal Day (Assembly Program)" },
  { date: "2026-11-23", end: "2026-11-26", title: "Results Preparation" },
  { date: "2026-11-29", title: "School Re-opens" },
  { date: "2026-12-08", title: "Mid-Term Result announced" },
  { date: "2026-12-11", title: "PTM III (4–6 pm)" },
  { date: "2026-12-13", title: "Spell Bee (I–IV) & Flash Cards (PG–KG)" },
  { date: "2026-12-18", title: "Commendation Ceremony (X–XII)" },
  { date: "2026-12-27", title: "Quaid-e-Azam Day (Assembly Program)" },
  { date: "2026-12-28", title: "Annual Urdu Debates (V–XII)" },
  { date: "2026-12-29", title: "Annual English Debates (V–XII)" },
  { date: "2026-12-29", title: "Poem Competition (PG–KG)" },
  { date: "2026-12-30", end: "2027-01-05", title: "Annual Sports (PG–XII) & Speech Competition (I–IV)" },
  { date: "2027-01-06", end: "2027-01-14", title: "Winter Break" },
  { date: "2027-01-07", title: "Meena Bazaar (Ladies)" },
  { date: "2027-01-17", title: "School Re-opens · Test Series (IX–X)" },
  { date: "2027-01-24", end: "2027-01-29", title: "Preparatory Leave (IX–X)" },
  { date: "2027-01-31", end: "2027-02-25", title: "Pre-Board Examination (IX–X)" },
  { date: "2027-02-07", title: "Kashmir Solidarity Day · Test Series (XI–XII)" },
  { date: "2027-02-19", title: "PTM IV (4–6 pm)" },
  { date: "2027-02-21", title: "Saudi Founding Day (Assembly Program)" },
  { date: "2027-02-22", title: "Saudi Founding Day (Holiday)" },
  { date: "2027-02-28", end: "2027-03-11", title: "Eid ul-Fitr Holidays" },
  { date: "2027-03-14", title: "School Re-opens" },
  { date: "2027-03-15", end: "2027-04-08", title: "Annual Examination (PG–VIII) & Pre-Board II (XI–XII)" },
  { date: "2027-03-23", title: "Pakistan Day (Assembly Program)" },
  { date: "2027-04-22", title: "Annual Exam Result (PG–VIII)" },
  { date: "2027-04-23", title: "PTM V (4–6 pm)" },
  { date: "2027-04-26", title: "Preparation of New Academic Session" },
  { date: "2027-04-27", title: "New Academic Session Starts (PG–IX)" },
];

function toDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Returns the next `limit` events whose end date is today or later, enriched
// with `start`/`finish` Date objects and sorted chronologically.
export function upcomingEvents(from = new Date(), limit = 6) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return SCHOOL_EVENTS.map((e) => ({
    ...e,
    start: toDate(e.date),
    finish: toDate(e.end || e.date),
  }))
    .filter((e) => e.finish >= today)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit);
}
