import { extractRecipe, isEnabled } from "../../../../lib/recipyai";

export const dynamic = "force-dynamic";

// Queues an extraction. This one costs real money — it transcribes the video
// and runs it through an LLM — so it is deliberately the only write the
// dashboard can make to RecipyAI.
export async function POST(request) {
  if (!isEnabled()) return Response.json({ error: "RecipyAI is not configured" }, { status: 404 });
  try {
    const { url } = await request.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return Response.json({ error: "A video URL is required" }, { status: 400 });
    }
    return Response.json(await extractRecipe(url));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
