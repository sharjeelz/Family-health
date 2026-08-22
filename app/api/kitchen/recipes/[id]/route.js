import { getRecipe, isEnabled } from "../../../../../lib/recipyai";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  if (!isEnabled()) return Response.json({ error: "RecipyAI is not configured" }, { status: 404 });
  try {
    return Response.json({ recipe: await getRecipe(params.id) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
