import fs from "node:fs/promises";
import { locate } from "../../../../lib/memories";

export const dynamic = "force-dynamic";

// Serves a photograph from data/memories/. They are deliberately not in
// public/: this repository is public and these are pictures of children.
export async function GET(_req, { params }) {
  // The id comes from the URL, and it indexes a database row rather than
  // being joined onto a path — so ".." in the URL cannot escape the folder.
  const hit = await locate(params.id).catch(() => null);
  if (!hit) return new Response("Not found", { status: 404 });

  try {
    const bytes = await fs.readFile(hit.path);
    return new Response(bytes, {
      headers: {
        "content-type": hit.mime,
        // Immutable: a memory's id never points at different bytes.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
