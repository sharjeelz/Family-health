// How many Daily minutes the video calls have used this month.
//
//   node scripts/daily-usage.mjs
//
// Read-only. It asks Daily for the session history and adds up the
// participant-minutes, which is the thing that is actually billed: one person
// in a call for ten minutes is ten participant-minutes, two people is twenty.
//
// The free allowance is 10,000 a month. Calls are capped at 45 minutes in
// lib/callSession.js, so even a call left running every single day comes to
// about 2,700 a month — the cap exists precisely so a forgotten call on the
// fridge tablet cannot quietly run up a bill.

import fs from "node:fs";
import path from "node:path";

const FREE_ALLOWANCE = 10000;

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local here — run this from the project root.");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
  if (m) env[m[1]] = m[2].trim();
}

if (!env.DAILY_API_KEY) {
  console.error("DAILY_API_KEY is not set in .env.local");
  process.exit(1);
}

const res = await fetch("https://api.daily.co/v1/meetings?limit=100", {
  headers: { Authorization: `Bearer ${env.DAILY_API_KEY}` },
});
const body = await res.json();
if (!res.ok) {
  console.error("Daily refused the request:", res.status, body.info || body.error || "");
  process.exit(1);
}

const now = new Date();
const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000;

let thisMonth = 0;
let allTime = 0;
const rows = [];

for (const s of body.data || []) {
  const minutes = (s.participants || []).reduce((t, p) => t + Math.max(0, p.duration || 0) / 60, 0);
  allTime += minutes;
  if (s.start_time >= monthStart) thisMonth += minutes;
  rows.push({ when: new Date(s.start_time * 1000), people: (s.participants || []).length, minutes });
}

rows.sort((a, b) => b.when - a.when);
for (const r of rows.slice(0, 15)) {
  const when = r.when.toISOString().slice(0, 16).replace("T", " ");
  console.log(`  ${when}  ${String(r.people).padStart(2)} in call  ${r.minutes.toFixed(1).padStart(7)} participant-min`);
}
if (rows.length > 15) console.log(`  … and ${rows.length - 15} older sessions`);

const left = FREE_ALLOWANCE - thisMonth;
const pct = ((thisMonth / FREE_ALLOWANCE) * 100).toFixed(2);

console.log("");
console.log(`This month : ${thisMonth.toFixed(1)} of ${FREE_ALLOWANCE} participant-minutes (${pct}%)`);
console.log(`Remaining  : ${left.toFixed(1)}`);
console.log(`All time   : ${allTime.toFixed(1)}`);
console.log("");
console.log(left > 0 ? "Nothing to pay." : "Over the free allowance — billed at $0.004 per extra minute.");
