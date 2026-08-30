// Photographs of the children's school events.
//
// They arrive by Telegram: send a photo to the family group with a caption and
// it is filed here. That is the whole intake — no upload screen, and it works
// from either phone, at the event, in the moment.
//
// Files go on disk under data/memories/ rather than public/. Two reasons: this
// repository is public and these are photographs of children, and a library
// that grows for years does not belong in git history at all.

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { query } from "./db";
import { CHILDREN } from "./plan";

const DIR = path.join(process.cwd(), "data", "memories");

// Created on first use rather than in a migration script, so nobody has to
// remember to run one before the first photograph arrives.
let ready = null;
async function ensure() {
  if (ready) return ready;
  ready = (async () => {
    await fs.mkdir(DIR, { recursive: true });
    await query(`CREATE TABLE IF NOT EXISTS memories (
      id          VARCHAR(32) PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      child_id    VARCHAR(32) NULL,          -- NULL = both children
      file        VARCHAR(120) NOT NULL,
      mime        VARCHAR(60) NOT NULL DEFAULT 'image/jpeg',
      compressed  TINYINT(1) NOT NULL DEFAULT 1,
      taken_at    DATETIME NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      KEY idx_taken (taken_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  })();
  return ready;
}

// "Zohaib sports day" -> { childId: "iiif", title: "sports day" }
// A caption naming neither child belongs to both.
export function readCaption(caption) {
  const text = (caption || "").trim();
  let childId = null;
  let title = text;

  for (const child of CHILDREN) {
    const name = new RegExp(String.raw`\b` + child.name + String.raw`\b`, "i");
    if (name.test(title)) {
      childId = childId ? null : child.id; // both named -> belongs to both
      title = title.replace(name, " ");
    }
  }

  title = title
    .replace(/\s{2,}/g, " ")
    // Naming both children leaves the conjunction behind: "Zohaib and Zainab
    // eid" would otherwise be filed as "and eid".
    .replace(/^\s*(and|&|\+|,)\s*/i, "")
    .replace(/^[\s,\-—:]+|[\s,\-—:]+$/g, "");
  return { childId, title: title || "Untitled" };
}

export async function save({ caption, bytes, at, compressed, ext }) {
  await ensure();
  const { childId, title } = readCaption(caption);
  const id = crypto.randomBytes(12).toString("hex");
  const file = `${id}.${ext || "jpg"}`;

  await fs.writeFile(path.join(DIR, file), bytes);
  await query(
    `INSERT INTO memories (id, title, child_id, file, mime, compressed, taken_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, title.slice(0, 200), childId, file, "image/jpeg", compressed ? 1 : 0, new Date(at || Date.now())],
  );
  return { id, title, childId };
}

export async function list({ limit = 60 } = {}) {
  await ensure();
  return query(
    `SELECT id, title, child_id, taken_at, compressed
       FROM memories
      ORDER BY taken_at DESC
      LIMIT ?`,
    [Math.min(limit, 200)],
  );
}

// Where a photograph actually is, for the route that serves it. Returns null
// rather than throwing so a deleted file is a 404, not a crash.
export async function locate(id) {
  await ensure();
  const rows = await query("SELECT file, mime FROM memories WHERE id = ?", [id]);
  if (!rows.length) return null;
  return { path: path.join(DIR, rows[0].file), mime: rows[0].mime };
}
