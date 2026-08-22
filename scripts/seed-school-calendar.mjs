// Creates the family_health DB + school_calendar table on the LAN MySQL and
// seeds it from lib/calendar.js. Safe to re-run — it replaces seeded rows only.
//   node scripts/seed-school-calendar.mjs
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

const c = await mysql.createConnection(cfg);
await c.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4`);
await c.query(`USE \`${db}\``);
await c.query(`CREATE TABLE IF NOT EXISTS school_calendar (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NULL,
  child_id      VARCHAR(32) NULL,          -- NULL = whole family
  category      VARCHAR(32) NOT NULL DEFAULT 'event',
  notes         VARCHAR(500) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event (title, start_date),
  KEY idx_start (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

// Rough bucketing so the UI can colour-code without parsing titles at render time.
function categorise(title) {
  const t = title.toLowerCase();
  if (/exam|test series|pre-board|result/.test(t)) return "exam";
  if (/vacation|break|holiday|eid|hajj/.test(t)) return "holiday";
  if (/ptm/.test(t)) return "ptm";
  if (/re-opens|classes start|session begins|teachers return/.test(t)) return "term";
  return "event";
}

const rows = SCHOOL_EVENTS.map((e) => [e.title, e.date, e.end || null, null, categorise(e.title), null]);
const [res] = await c.query(
  `INSERT INTO school_calendar (title, start_date, end_date, child_id, category, notes)
   VALUES ?
   ON DUPLICATE KEY UPDATE end_date = VALUES(end_date), category = VALUES(category)`,
  [rows]
);

const [[{ n }]] = await c.query("SELECT COUNT(*) AS n FROM school_calendar");
console.log(`seeded ${rows.length} events (affected ${res.affectedRows}) — table now holds ${n} rows`);
await c.end();
