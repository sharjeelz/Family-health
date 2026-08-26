// Creates the family_health DB + school_calendar table on the LAN MySQL and
// seeds it from lib/calendar.js.
//
//   node scripts/seed-school-calendar.mjs --dry-run   show what would change
//   node scripts/seed-school-calendar.mjs             apply it
//
// Seeded rows are marked source='seed' and are REPLACED wholesale on each run,
// so changing schools does not leave the old school's events behind. Anything
// added by hand should be marked source='manual' and is never touched.
import fs from "node:fs";
import mysql from "mysql2/promise";
import { SCHOOL_EVENTS } from "../lib/calendar.js";

// Minimal .env.local reader — this script runs outside Next, so nothing loads it for us.
for (const line of fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].trim();
}

const cfg = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};
const db = process.env.MYSQL_DATABASE;

let c;
try {
  c = await mysql.createConnection({ ...cfg, connectTimeout: 8000 });
} catch (err) {
  // The usual cause is running this away from home: MySQL sits on the LAN and
  // is not reachable from anywhere else. A stack trace does not say that.
  console.error(`Cannot reach MySQL at ${cfg.host}:${cfg.port} — ${err.code || err.message}`);
  console.error("This has to run on the home network, with the MySQL container up.");
  process.exit(1);
}
await c.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4`);
await c.query(`USE \`${db}\``);
await c.query(`CREATE TABLE IF NOT EXISTS school_calendar (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NULL,
  child_id      VARCHAR(32) NULL,          -- NULL = whole family
  category      VARCHAR(32) NOT NULL DEFAULT 'event',
  source        VARCHAR(16) NOT NULL DEFAULT 'seed',   -- 'seed' = from lib/calendar.js
  notes         VARCHAR(500) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event (title, start_date),
  KEY idx_start (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

// Rough bucketing so the UI can colour-code without parsing titles at render time.
function categorise(title) {
  const t = title.toLowerCase();
  // Holidays first: "Eid Al-Fitr Holiday" would otherwise never be reached,
  // and an Eid break matters more than any word that follows it.
  if (/holiday|break|vacation|eid/.test(t)) return "holiday";
  if (/exam|quizz|revision|result/.test(t)) return "exam";
  if (/parents teacher conference/.test(t)) return "ptm";
  if (/semester (begins|ends)|ay \d{4}|re-opens|classes start/.test(t)) return "term";
  return "event";
}

const dryRun = process.argv.includes("--dry-run");

// The column is new; older tables predate it. Adding it defaults every existing
// row to 'seed', which is what we want here — they are all the previous
// school's, and they should go.
const [cols] = await c.query("SHOW COLUMNS FROM school_calendar LIKE 'source'");
if (!cols.length) {
  if (dryRun) console.log("would add the `source` column to school_calendar");
  else await c.query("ALTER TABLE school_calendar ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'seed'");
}

const [[{ n: before }]] = await c.query("SELECT COUNT(*) AS n FROM school_calendar");
const [[{ n: seeded }]] = cols.length
  ? await c.query("SELECT COUNT(*) AS n FROM school_calendar WHERE source = 'seed'")
  : [[{ n: before }]];
const [[{ n: manual }]] = cols.length
  ? await c.query("SELECT COUNT(*) AS n FROM school_calendar WHERE source <> 'seed'")
  : [[{ n: 0 }]];

console.log(`table holds ${before} rows — ${seeded} seeded, ${manual} added by hand`);
console.log(`lib/calendar.js has ${SCHOOL_EVENTS.length} events`);
if (dryRun) console.log("\nDRY RUN — nothing will be written\n");
console.log(`  delete ${seeded} seeded rows (anything added by hand is kept)`);
console.log(`  insert ${SCHOOL_EVENTS.length} events`);

if (dryRun) {
  console.log("\nRun without --dry-run to apply.");
  await c.end();
  process.exit(0);
}

// Replace wholesale rather than merge: switching schools must not leave the
// old school's events behind, and an ON DUPLICATE KEY update alone would.
await c.query("DELETE FROM school_calendar WHERE source = 'seed'");

const rows = SCHOOL_EVENTS.map((e) => [e.title, e.date, e.end || null, null, categorise(e.title), null, "seed"]);
const [res] = await c.query(
  `INSERT INTO school_calendar (title, start_date, end_date, child_id, category, notes, source)
   VALUES ?
   ON DUPLICATE KEY UPDATE end_date = VALUES(end_date), category = VALUES(category)`,
  [rows]
);

const [[{ n }]] = await c.query("SELECT COUNT(*) AS n FROM school_calendar");
const [byCat] = await c.query(
  "SELECT category, COUNT(*) AS n FROM school_calendar GROUP BY category ORDER BY n DESC"
);
console.log(`\nseeded ${rows.length} events (affected ${res.affectedRows}) — table now holds ${n} rows`);
for (const r of byCat) console.log(`  ${String(r.n).padStart(3)}  ${r.category}`);
await c.end();
