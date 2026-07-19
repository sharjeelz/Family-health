// Parses a PIS syllabus PDF (2-column week tables) into structured weeks.
// Input: `pdftotext -table -enc UTF-8 file.pdf -` on stdin.
// Arg: JSON of { subject: [firstPage, lastPage] }. Prints JSON to stdout.
//
// Each page has two columns (left = one week, right = the next); each week
// cell begins with a month header, so we split blocks at month headers and
// pull the WEEK number / date range from the narrow meta sub-column.

const MONTHS = "January February March April May June July August September October November December".split(" ");
const isMonth = (s) => MONTHS.includes(s.trim());

function isJunk(s) {
  const t = s.trim();
  if (!t) return true;
  if (/PAKISTAN|INTERNATIONAL SCHOOL|RIYADH|SYLLABUS DISTRIBUTION|FIRST TERM|1st TERM/i.test(t)) return true;
  if (/^Class:/i.test(t) || /^Subject:/i.test(t)) return true;
  return false;
}

function parseHalf(lines, out) {
  let cur = null;
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (isMonth(t)) {
      cur = { week: null, dates: null, month: t, content: [] };
      out.push(cur);
      continue;
    }
    if (!cur) continue; // header text before the first month = skip
    if (isJunk(t)) continue;

    const m = t.match(/^(WEEK|\(\d+\s*days?\)|\d{1,2}\s*[-–]\s*\d{1,2}|\d{1,2})(?:\s{2,}([\s\S]*))?$/i);
    if (m) {
      const tok = m[1];
      const rest = (m[2] || "").trim();
      if (/^\d{1,2}$/.test(tok)) { if (cur.week == null) cur.week = Number(tok); }
      else if (/^\d{1,2}\s*[-–]\s*\d{1,2}$/.test(tok)) { if (!cur.dates) cur.dates = tok.replace(/\s/g, ""); }
      if (rest && !isMonth(rest) && !isJunk(rest)) cur.content.push(rest);
    } else {
      cur.content.push(t);
    }
  }
}

function parsePage(text) {
  const lines = text.split("\n");
  // Right-column WEEK markers sit well past the middle; collect their columns.
  const cols = [];
  for (const l of lines) {
    let idx = l.indexOf("WEEK");
    while (idx >= 0) { if (idx > 25) cols.push(idx); idx = l.indexOf("WEEK", idx + 4); }
  }
  const maxLen = Math.max(80, ...lines.map((l) => l.length));
  let split = cols.length ? Math.min(...cols) : Math.floor(maxLen / 2);
  // Move the split left into the whitespace gap just before the right column's
  // meta (WEEK/number/date), so no stray char leaks into the left half.
  if (cols.length) {
    let best = split, bestScore = Infinity;
    for (let c = split - 1; c >= split - 14 && c >= 0; c--) {
      let score = 0;
      for (const l of lines) if (l[c] && l[c] !== " ") score++;
      if (score < bestScore) { bestScore = score; best = c; } // leftmost-among-lowest
    }
    split = best;
  }
  const out = [];
  parseHalf(lines.map((l) => l.slice(0, split)), out);
  parseHalf(lines.map((l) => l.slice(split)), out);
  return out;
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (input += d)).on("end", () => {
  const ranges = JSON.parse(process.argv[2] || "{}");
  const pages = input.split("\f");
  const bySubject = {};
  for (const [subject, [f, l]] of Object.entries(ranges)) {
    const weeks = [];
    for (let p = f; p <= l; p++) if (pages[p - 1]) weeks.push(...parsePage(pages[p - 1]));
    const seen = new Set();
    bySubject[subject] = weeks
      .map((w) => ({ ...w, content: w.content.map((c) => c.replace(/\s+/g, " ").trim()).filter((c) => c.length > 1) }))
      .filter((w) => w.week != null && w.content.length)
      .filter((w) => (seen.has(w.week) ? false : seen.add(w.week)))
      .sort((a, b) => a.week - b.week);
  }
  process.stdout.write(JSON.stringify(bySubject, null, 2));
});
