import { searchVideos, isEnabled } from "../../../../lib/recipyai";

export const dynamic = "force-dynamic";
// yt-dlp reaching YouTube is the slow part, not us.
export const maxDuration = 60;

export async function GET(request) {
  if (!isEnabled()) return Response.json({ error: "RecipyAI is not configured" }, { status: 404 });
  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  if (q.length < 2) return Response.json({ error: "Type at least two characters" }, { status: 400 });
  try {
    return Response.json({ results: await searchVideos(q) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
