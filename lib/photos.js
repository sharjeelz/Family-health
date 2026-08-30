// Photographs arriving in the family group get filed as memories.
//
// Separate from lib/memories.js so the storage layer knows nothing about
// Telegram, and the Telegram side knows nothing about MySQL.

import { downloadFile } from "./telegram";
import { save } from "./memories";

export async function keepPhotos(messages) {
  for (const m of messages) {
    if (!m.file) continue;

    // Telegram's own limit for the Bot API. A larger file simply cannot be
    // fetched, so say so rather than failing silently on a memory someone
    // thinks they have saved.
    if (m.file.size > 20 * 1024 * 1024) {
      console.log("[photos] too large for the Bot API (20MB limit) — skipped");
      continue;
    }

    try {
      const { bytes, path } = await downloadFile(m.file.id);
      const ext = (path.split(".").pop() || "jpg").toLowerCase().slice(0, 4);
      const saved = await save({
        caption: m.caption,
        bytes,
        at: m.at,
        compressed: m.file.compressed,
        ext,
      });
      console.log(`[photos] kept "${saved.title}"${saved.childId ? ` for ${saved.childId}` : ""}`);
    } catch (err) {
      console.log("[photos] could not keep one:", err.message);
    }
  }
}
