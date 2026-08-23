import { translateRecipe, isEnabled } from "../../../../../../lib/recipyai";

export const dynamic = "force-dynamic";
// The first translation of a recipe is a live LLM call; later ones are cached.
export const maxDuration = 90;

export async function POST(request, { params }) {
  if (!isEnabled()) return Response.json({ error: "RecipyAI is not configured" }, { status: 404 });
  try {
    const { language } = await request.json().catch(() => ({}));
    return Response.json({ translation: await translateRecipe(params.id, language || "ur") });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
