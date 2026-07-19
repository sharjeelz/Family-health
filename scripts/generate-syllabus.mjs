// Combines the parsed per-subject JSON into lib/syllabusData.js:
// clean English-script subjects become week-by-week text; RTL subjects
// (Urdu/Arabic/Quran) become "view page" PDF links.
import { readFileSync, writeFileSync } from "node:fs";

const MONTHS = { January:1, February:2, March:3, April:4, May:5, June:6, July:7, August:8, September:9, October:10, November:11, December:12 };
const YEAR = 2026;
const iso = (m, d) => `${YEAR}-${String(MONTHS[m]).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

function build(parsed, cleanSubjects) {
  const weekMap = new Map(); // weekNo -> { week, dates, month, subjects: [] }
  for (const subj of cleanSubjects) {
    const list = parsed[subj] || [];
    for (const w of list) {
      if (w.week < 1 || w.week > 18) continue; // drop parse anomalies (e.g. 56)
      if (!weekMap.has(w.week)) weekMap.set(w.week, { week: w.week, dates: null, month: null, subjects: [] });
      const wk = weekMap.get(w.week);
      if (!wk.dates && w.dates) wk.dates = w.dates;
      if (!wk.month && w.month) wk.month = w.month;
      if (w.content.length) wk.subjects.push({ name: subj, lines: w.content });
    }
  }
  const weeks = [...weekMap.values()]
    .filter((w) => w.subjects.length)
    .sort((a, b) => a.week - b.week)
    .map((w) => {
      let start = null, end = null;
      if (w.dates && w.month && MONTHS[w.month]) {
        const [d1, d2] = w.dates.split("-").map(Number);
        start = iso(w.month, d1);
        end = iso(w.month, d2 || d1);
      }
      return { week: w.week, dates: w.dates, month: w.month, start, end, subjects: w.subjects };
    });
  return weeks;
}

const g3 = JSON.parse(readFileSync("lib/_g3.json"));
const nur = JSON.parse(readFileSync("lib/_nur.json"));

const zohaib = {
  label: "Zohaib",
  grade: "Grade III",
  pdf: "/syllabus-grade3.pdf",
  weeks: build(g3, ["English","Mathematics","Science","Islamiyat","Computer Science","Social Studies","Saudi History","Arts"]),
  pdfSubjects: [ { name: "Urdu", page: 5 }, { name: "Arabic", page: 30 }, { name: "Quran", page: 33 } ],
};

const zainab = {
  label: "Zainab",
  grade: "Nursery",
  pdf: "/syllabus-nursery.pdf",
  weeks: build(nur, ["English","Maths","Social Studies","Islamiyat & Islamic Knowledge","Fun Time","Physical Education","Art & Craft","Circle Time"]),
  pdfSubjects: [ { name: "Urdu", page: 5 } ],
};

const out = "// AUTO-GENERATED from the syllabus PDFs (scripts/generate-syllabus.mjs).\n" +
  "// Clean English-script subjects are scraped week-by-week (verbatim); RTL\n" +
  "// subjects (Urdu/Arabic/Quran) fall back to a link to their PDF page.\n\n" +
  "export const SYLLABUS = " + JSON.stringify({ zohaib, zainab }, null, 2) + ";\n";
writeFileSync("lib/syllabusData.js", out);

// sanity summary
for (const [k, c] of [["zohaib", zohaib], ["zainab", zainab]]) {
  console.log(`\n${k}: ${c.weeks.length} weeks`);
  for (const w of c.weeks) console.log(`  W${w.week} ${w.month} ${w.dates} (${w.start}..${w.end}) — ${w.subjects.map(s=>s.name).length} subjects`);
}
